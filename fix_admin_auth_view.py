import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'function AdminAuthScreen' in line:
        # Search for the closing </View> of the main container
        # It's usually a few lines before the next function or the end of the file.
        for j in range(i + 50, len(lines)):
            if 'function WorkerDetailScreen' in lines[j]:
                # The closing tag should be around lines[j-2]
                if '    </View>' in lines[j-2] and '  );' in lines[j-3]:
                    # Need to check the structure
                    pass
                break

# Actually, I'll just use the depth counter approach again but more carefully.
found_admin_auth = False
for i, line in enumerate(lines):
    if 'function AdminAuthScreen' in line:
        found_admin_auth = True
        for j in range(i, len(lines)):
            if 'return (' in lines[j]:
                # Start tracking from the first <View
                depth = 0
                for k in range(j+1, len(lines)):
                    # Check for opening tags
                    depth += lines[k].count('<View')
                    # Check for closing tags
                    depth -= lines[k].count('</View')

                    if depth == -1: # Root View closed
                        # We already added the opening tag in update_auth_layouts.py
                        # Let's see if we need to add the closing tag.
                        # Wait, update_auth_layouts.py already did this!
                        # lines[k] = '      </View>\n    </View>\n'
                        break
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
