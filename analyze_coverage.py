import json

with open('coverage/coverage-final.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

results = []
for filepath, info in data.items():
    idx = filepath.find('src')
    if idx == -1:
        continue
    norm = filepath[idx:].replace('\\', '/')
    branch_map = info.get('b', {})
    total_branches = 0
    covered_branches = 0
    for branch_id, counts in branch_map.items():
        total_branches += len(counts)
        covered_branches += sum(1 for c in counts if c > 0)
    if total_branches > 0:
        pct = covered_branches / total_branches * 100
        results.append((norm, pct, covered_branches, total_branches))

results.sort(key=lambda x: x[1])
print('=== Branch Coverage < 80% (sorted by coverage) ===')
for f, pct, cov, total in results:
    if pct < 80:
        print(f'{f:<80} {pct:>5.1f}% {cov:>5}/{total:<5}')

print()
print('=== Summary by package (branch cov < 80%) ===')
pkg_map = {}
for f, pct, cov, total in results:
    parts = f.split('/')
    pkg = parts[1] if len(parts) > 1 else 'root'
    if pkg not in pkg_map:
        pkg_map[pkg] = [0, 0]
    pkg_map[pkg][0] += cov
    pkg_map[pkg][1] += total
for pkg in sorted(pkg_map.keys(), key=lambda x: pkg_map[x][0]/pkg_map[x][1]):
    cov, total = pkg_map[pkg]
    pct = cov/total*100
    if pct < 80:
        print(f'  {pkg:<30} {pct:>5.1f}% {cov:>5}/{total:<5}')
