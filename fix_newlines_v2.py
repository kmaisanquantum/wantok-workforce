import re

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

# Pattern to find strings containing literal newlines within alert() or console.log() or alert("..." + ...)
# We'll just do a global replacement of the specific problematic strings found in the grep
replacements = {
    'alert("Network Status: " + response.status + "\nDetails: "': 'alert("Network Status: " + response.status + "\\nDetails: "',
    'alert("Network Status: OFFLINE\nDetails: "': 'alert("Network Status: OFFLINE\\nDetails: "'
}

fixed_content = content
for old, new in replacements.items():
    fixed_content = fixed_content.replace(old, new)

with open('WantokWorkforce.js', 'w') as f:
    f.write(fixed_content)
