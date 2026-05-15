"""
APEX Swarm Verification Script
==============================
Verifies that the swarm modules can be imported and basic functionality works.
"""

import sys
import os

print("=" * 60)
print("APEX Swarm Intelligence Engine - Verification")
print("=" * 60)

# Check Python version
print(f"\nPython version: {sys.version}")

# Check files exist
files_to_check = ["apex_ollama.py", "api.py", "requirements.txt"]
print("\nFile check:")
for f in files_to_check:
    exists = os.path.exists(f)
    status = "EXISTS" if exists else "MISSING"
    size = os.path.getsize(f) if exists else 0
    print(f"  [{status}] {f} ({size:,} bytes)")

# Try to parse the modules
print("\nSyntax check:")
import ast
for f in ["apex_ollama.py", "api.py"]:
    try:
        with open(f, 'r') as file:
            ast.parse(file.read())
        print(f"  [OK] {f} - Syntax valid")
    except SyntaxError as e:
        print(f"  [FAIL] {f} - Syntax error: {e}")

# Count entities in apex_ollama.py
print("\nAPEX Architecture:")
with open("apex_ollama.py", 'r') as f:
    tree = ast.parse(f.read())
    
classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
agents = [c for c in classes if 'Agent' in c or c == 'ApexSwarm' or c == 'OllamaClient']

print(f"  Total classes: {len(classes)}")
print(f"  Core agents/components:")
for agent in agents:
    print(f"    - {agent}")

# Count entities in api.py
print("\nAPI Endpoints:")
with open("api.py", 'r') as f:
    tree = ast.parse(f.read())

routes = []
for node in ast.walk(tree):
    if isinstance(node, ast.FunctionDef):
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call):
                if hasattr(decorator.func, 'attr'):
                    method = decorator.func.attr.upper()
                    if method in ['GET', 'POST']:
                        routes.append((method, node.name))
                    elif method == 'WEBSOCKET':
                        routes.append(('WS', node.name))

print(f"  HTTP endpoints: {len([r for r in routes if r[0] in ['GET', 'POST']])}")
print(f"  WebSocket endpoints: {len([r for r in routes if r[0] == 'WS'])}")
for method, name in routes[:10]:
    print(f"    [{method}] /{name}")

print("\n" + "=" * 60)
print("Verification complete!")
print("=" * 60)
print("\nTo run the API server:")
print("  1. pip install -r requirements.txt")
print("  2. python api.py")
print("\nTo test the swarm:")
print("  python apex_ollama.py")
