import sys

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

content = content.replace('if (activeTab === "dashboard") {', 'if (activeTab === "dashboard") {\n      fetchUsers();')

with open('WantokWorkforce.js', 'w') as f:
    f.write(content)
