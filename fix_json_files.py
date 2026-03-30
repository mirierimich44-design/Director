import json
import re
import os
import glob

def to_camel_case(s):
    s = re.sub(r'[^a-zA-Z0-9\s_]', ' ', s)
    s = s.replace('_', ' ')
    words = s.split()
    if not words: return ''
    return words[0].lower() + ''.join(w.capitalize() for w in words[1:])

directory = r'C:\Users\MICH\desktop\Code Files\director\server\projects'
json_files = glob.glob(os.path.join(directory, '*.json'))

for file_path in json_files:
    if '75b61a5b-757e-4b67-8cb3-f522fc908b19.json' in file_path:
        continue

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    modified = False

    for chapter in data.get('chapters', []):
        for scene in chapter.get('scenes', []):
            code = scene.get('code')
            if not code: continue
            
            new_code = code
            pattern = r"const\s+([^=]+?)\s*=\s*(['\"`])(.*?)\2"
            matches = re.finditer(pattern, code)
            
            replacements = []
            for match in matches:
                var_name = match.group(1).strip()
                val = match.group(3)
                
                is_invalid = False
                if not re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', var_name):
                    is_invalid = True
                elif var_name == val and not var_name.islower():
                    is_invalid = True
                
                if is_invalid:
                    new_var_name = to_camel_case(var_name)
                    if new_var_name and new_var_name != var_name and re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', new_var_name):
                        replacements.append((var_name, new_var_name))
            
            unique_replacements = list(set(replacements))
            unique_replacements.sort(key=lambda x: len(x[0]), reverse=True)
            
            for var_name, new_var_name in unique_replacements:
                print(f"[{os.path.basename(file_path)}] Scene {scene.get('globalIndex')}: '{var_name}' -> '{new_var_name}'")
                decl_pattern = r"const\s+" + re.escape(var_name) + r"\s*="
                new_code = re.sub(decl_pattern, f"const {new_var_name} =", new_code)
                
                bracket_pattern = r"\{" + re.escape(var_name) + r"\}"
                new_code = re.sub(bracket_pattern, f"{{{new_var_name}}}", new_code)
                
                if re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', var_name):
                    usage_pattern = r'(?<![\'"`])\b' + re.escape(var_name) + r'\b(?![\'"`])'
                    new_code = re.sub(usage_pattern, new_var_name, new_code)
                else:
                    array_pattern = r"\[\s*" + re.escape(var_name) + r"\s*\]"
                    new_code = re.sub(array_pattern, f"[{new_var_name}]", new_code)
                    # We can use simple text replace if it's not a valid word, but we must be careful not to replace it in strings.
                    # Since it has spaces or special characters, it won't be matched by \b regex.
                    # Let's replace simple usages:
                    new_code = new_code.replace(f" {var_name} ", f" {new_var_name} ")
                    new_code = new_code.replace(f"({var_name})", f"({new_var_name})")
                    new_code = new_code.replace(f",{var_name},", f",{new_var_name},")
                    new_code = new_code.replace(f", {var_name},", f", {new_var_name},")

            if new_code != code:
                scene['code'] = new_code
                modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"File {os.path.basename(file_path)} updated successfully.")
    else:
        print(f"File {os.path.basename(file_path)}: No changes needed.")