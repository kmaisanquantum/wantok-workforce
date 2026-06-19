import sys

file_path = 'backend/db/db_init.js'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace(
    'await client.query(adminSeed);',
    'await client.query(adminSeed);\n      const statsSeed = fs.readFileSync(path.join(__dirname, "seed_stats.sql"), "utf8");\n      await client.query(statsSeed);'
)

with open(file_path, 'w') as f:
    f.write(content)
