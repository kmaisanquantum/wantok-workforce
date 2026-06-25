import sys

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

# Fix literal backslashes in front of quotes inside template literals or strings
content = content.replace('\\"', '"')

with open('WantokWorkforce.js', 'w') as f:
    f.write(content)
