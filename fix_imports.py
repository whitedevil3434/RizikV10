import os

root_dirs = ['/Users/sabbir/Downloads/flutter_rizik/lib', '/Users/sabbir/Downloads/flutter_rizik/test']
package_name = 'flutter_rizik'

# 1. Build a map of filename -> new package path
file_map = {}

print("Scanning for files...")
for root_dir in root_dirs:
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.dart'):
                # For map, we only care about lib files for package: imports
                if 'lib' in subdir:
                     rel_path = os.path.relpath(os.path.join(subdir, file), '/Users/sabbir/Downloads/flutter_rizik/lib')
                     package_path = f'package:{package_name}/{rel_path}'
                     file_map[file] = package_path

print(f"Found {len(file_map)} Dart files in lib.")

# 2. Update imports in all files
print("Updating imports...")
for root_dir in root_dirs:
    for subdir, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.dart'):
                file_path = os.path.join(subdir, file)
                
                with open(file_path, 'r') as f:
                    lines = f.readlines()
                
                new_lines = []
                modified = False
                
                for line in lines:
                    stripped = line.strip()
                    if stripped.startswith('import') or stripped.startswith('export'):
                        # Extract the path
                        parts = line.split("'")
                        if len(parts) > 1:
                            old_import = parts[1]
                            old_filename = old_import.split('/')[-1]
                            
                            # Fix package imports
                            if f'package:{package_name}/' in old_import:
                                if old_filename in file_map:
                                    new_import = file_map[old_filename]
                                    if new_import != old_import:
                                        line = line.replace(old_import, new_import)
                                        modified = True
                            
                            # Fix relative imports (convert to package imports for safety)
                            elif not old_import.startswith('package:') and not old_import.startswith('dart:'):
                                 if old_filename in file_map:
                                    new_import = file_map[old_filename]
                                    line = line.replace(old_import, new_import)
                                    modified = True

                    new_lines.append(line)
                
                if modified:
                    with open(file_path, 'w') as f:
                        f.writelines(new_lines)
                    print(f"Updated {file}")

print("Import fix complete.")
