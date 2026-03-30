import json
import re

def to_camel_case(s):
    # Remove non-alphanumeric characters except spaces and underscores
    s = re.sub(r'[^a-zA-Z0-9\s_]', ' ', s)
    # Replace underscores with spaces
    s = s.replace('_', ' ')
    # Split by spaces
    words = s.split()
    if not words:
        return ""
    # Lowercase first word, capitalize others
    return words[0].lower() + "".join(w.capitalize() for w in words[1:])

file_path = r'C:\Users\MICH\desktop\Code Files\director\server\projects\75b61a5b-757e-4b67-8cb3-f522fc908b19.json'

with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

modified = False

for chapter in data.get('chapters', []):
    for scene in chapter.get('scenes', []):
        code = scene.get('code')
        if not code:
            continue
        
        new_code = code
        
        # Regex to find const declarations with spaces, underscores, or uppercase names that are not valid
        # This will catch "const Some name = 'val';" or "const SOME_NAME = 'val';"
        # We will match anything between 'const ' and '='.
        pattern = r"const\s+([^=]+?)\s*=\s*['\"`]"
        
        matches = re.finditer(pattern, code)
        
        replacements = []
        for match in matches:
            var_name = match.group(1).strip()
            
            # Skip valid camelCase/pascalCase variables without spaces or special chars
            if re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', var_name) and not var_name.isupper():
                continue
                
            new_var_name = to_camel_case(var_name)
            if new_var_name and new_var_name != var_name:
                replacements.append((var_name, new_var_name))
        
        if replacements:
            # Sort by length descending
            replacements.sort(key=lambda x: len(x[0]), reverse=True)
            for var_name, new_var_name in replacements:
                print(f"In scene {scene.get('globalIndex')}, renaming '{var_name}' to '{new_var_name}'")
                
                # Replace declaration
                decl_pattern = r"const\s+" + re.escape(var_name) + r"\s*="
                new_code = re.sub(decl_pattern, f"const {new_var_name} =", new_code)
                
                # Replace references
                # We use a pattern to replace occurrences of var_name, taking care not to replace inside words
                # For names with special characters (like .), word boundaries might be tricky
                # But since it's a replacement for something like "Unlocking the source of the breach.", we can just replace exact matches
                ref_pattern = re.escape(var_name)
                # But we don't want to replace occurrences inside the string value itself.
                # Actually, the prompt says "update all references to them (e.g., {SOME VALUE WITH SPACES}) within that code string."
                
                # Let's replace {VAR_NAME} specifically
                bracket_pattern = r"\{" + re.escape(var_name) + r"\}"
                new_code = re.sub(bracket_pattern, f"{{{new_var_name}}}", new_code)
                
                # Also replace direct usages if any (like in arrays or props) that are not in strings
                # This is harder to do safely with regex. 
                # Let's just do an exact string replacement for the variable name, but only if it's not surrounded by quotes.
                # To keep it simple, we replace occurrences of `{var_name}` and `, var_name,` or `[var_name]`
                
                # We can replace all occurrences of `var_name` that are not inside quotes.
                # Since {var_name} is already handled, we can try to handle others:
                # E.g. console.log(var_name) -> we can just use re.sub for \bvar_name\b if it has no special chars
                if re.match(r'^\w+$', var_name):
                     new_code = re.sub(r'\b' + var_name + r'\b', new_var_name, new_code)
                else:
                     # For names with spaces, they can only be used in {name} or [name] or similar.
                     pass

            if new_code != code:
                scene['code'] = new_code
                modified = True

if modified:
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("File updated successfully.")
else:
    print("No changes needed.")
