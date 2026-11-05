
import sqlite3

# Connect to AgileFlow database
conn = sqlite3.connect("agileflow.db")
cursor = conn.cursor()

# Get all table names
cursor.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
)

tables = cursor.fetchall()

print("AGILEFLOW DATABASE VERIFICATION")
print("--------------------------------")

for table in tables:
    name = table[0]

    cursor.execute(f'SELECT COUNT(*) FROM "{name}"')
    count = cursor.fetchone()[0]

    print(name, ":", count, "records")

conn.close()

print("--------------------------------")
print("Database verification completed!")
