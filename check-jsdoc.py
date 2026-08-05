import os, re

component_dir = "D:/Workspace/projects/QimenJs/src/component"
results = []

for root, dirs, files in os.walk(component_dir):
    for fname in files:
        if not fname.endswith(".ts") or fname == "index.ts":
            continue
        fpath = os.path.join(root, fname)
        relpath = os.path.relpath(fpath, component_dir).replace(os.sep, "/")
        
        with open(fpath, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        exported_names = set()
        for i, line in enumerate(lines):
            trimmed = line.strip()
            if trimmed.startswith("export {"):
                content = re.sub(r"^export\s*\{\s*", "", trimmed)
                content = re.sub(r"\s*\}.*$", "", content)
                names = [n.split(" as ")[0].strip() for n in content.split(",")]
                names = [n for n in names if n and n != "}"]
                exported_names.update(names)
        
        missing = []
        direct_pats = [("export type ", 2), ("export interface ", 2), ("export class ", 2), ("export const ", 2), ("export function ", 2), ("export enum ", 2), ("export abstract class ", 3)]
        indirect_pats = [("type ", 1), ("interface ", 1), ("class ", 1), ("const ", 1), ("function ", 1), ("enum ", 1), ("abstract class ", 2)]
        
        for i, line in enumerate(lines):
            trimmed = line.strip()
            is_exported = False
            symbol_name = ""
            
            for pat, idx in direct_pats:
                if trimmed.startswith(pat):
                    is_exported = True
                    parts = trimmed.split()
                    if len(parts) > idx:
                        symbol_name = parts[idx]
                    symbol_name = re.sub(r"[<{{;].*$", "", symbol_name)
                    break
            
            if not is_exported:
                for pat, idx in indirect_pats:
                    if trimmed.startswith(pat):
                        parts = trimmed.split()
                        if len(parts) > idx:
                            name = parts[idx]
                        else:
                            name = ""
                        if name in exported_names:
                            is_exported = True
                            symbol_name = name
                        break
            
            if is_exported and symbol_name:
                has_jsdoc = False
                j = i - 1
                while j >= 0 and lines[j].strip() == "":
                    j -= 1
                if j >= 0:
                    prev = lines[j].strip()
                    # Check single-line JSDoc: /** ... */
                    if re.search(r"/\*\s*.*\s*]Ê/", prev):
                        has_jsdoc = True
                    # Check multi-line JSDoc: ... */
                    elif prev == "*/":
                        k = j - 1
                        while k >= 0:
                            if re.search(r"/\**", lines[k].strip()):
                                has_jsdoc = True
                                break
                            if lines[k].strip() == "*/" and k != j:
                                break
                            k -= 1
                
                if not has_jsdoc:
                    missing.append((symbol_name, i + 1))
        
        if missing:
            results.append((relpath, missing))

results.sort()
for relpath, missing in results:
    print("=== %s ===" % relpath)
    for symbol, line in missing:
        print("  - %s (line %d)" % (symbol, line))
    print()
