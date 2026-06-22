import re

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

# Find alert calls with literal newlines in strings
# Pattern matches alert("... followed by a literal newline
fixed_content = re.sub(r'alert\("(Network Status: [^"]*)\n([^"]*)"\)', r'alert("\1\n\2")', content)

with open('WantokWorkforce.js', 'w') as f:
    f.write(fixed_content)
