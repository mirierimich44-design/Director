import os
import re

def to_camel_case(snake_str):
    components = snake_str.split('_')
    return components[0].lower() + ''.join(x.title() for x in components[1:])

directory = 'server/templates'
updated_count = 0

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all matching variables
            # Pattern: const VAR_NAME = 'VAR_NAME' or const VAR_NAME = "VAR_NAME"
            pattern = r'const\s+([A-Z0-9_]+)\s*=\s*(["\'])\1\2'
            matches = re.findall(pattern, content)
            
            if not matches:
                continue
            
            new_content = content
            for match in matches:
                var_name = match[0]
                quote = match[1]
                camel_name = to_camel_case(var_name)
                
                # First, safely update the declaration
                # const VAR_NAME = 'VAR_NAME' -> const camelName = 'VAR_NAME'
                decl_pattern = r'const\s+' + re.escape(var_name) + r'\s*=\s*' + quote + re.escape(var_name) + quote
                new_decl = f'const {camel_name} = {quote}{var_name}{quote}'
                
                # We do this specifically for the declaration first
                new_content = re.sub(decl_pattern, new_decl, new_content)
                
                # Replace usages, ensuring we don't replace inside strings
                # We use negative lookbehind/lookahead for both single and double quotes
                usage_pattern = r'(?<![\'"])(?<!\w)(' + re.escape(var_name) + r')(?!\w)(?![\'"])'
                new_content = re.sub(usage_pattern, camel_name, new_content)
                
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")
                updated_count += 1

print(f"Finished refactoring {updated_count} files.")