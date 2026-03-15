"""Contract verification script"""
import urllib.request, json

base = 'http://127.0.0.1:8080/api'

# 1. GET /api/dimensions
resp = urllib.request.urlopen(f'{base}/dimensions')
dims = json.loads(resp.read().decode('utf-8'))
dim_fields = set(dims['dimensions'][0].keys())
expected_dim_fields = {'id','name','category','category_name','definition','char_count','status','summary'}
print('=== Dimensions ===')
print(f'Fields match: {dim_fields == expected_dim_fields}')
if dim_fields != expected_dim_fields:
    print(f'  Extra: {dim_fields - expected_dim_fields}')
    print(f'  Missing: {expected_dim_fields - dim_fields}')
print(f'Top-level keys: {set(dims.keys())}')
expected_top = {'dimensions','total','categories'}
print(f'Top match: {set(dims.keys()) == expected_top}')
cat_fields = set(dims['categories'][0].keys())
expected_cat = {'key','name','count'}
print(f'Category fields match: {cat_fields == expected_cat}')
print(f'total={dims["total"]}, actual_count={len(dims["dimensions"])}')

# 2. GET /api/task-types
resp = urllib.request.urlopen(f'{base}/task-types')
tt = json.loads(resp.read().decode('utf-8'))
print('\n=== TaskTypes ===')
print(f'Top keys: {set(tt.keys())}')
tt_fields = set(tt['task_types'][0].keys())
expected_tt = {'key','name','description'}
print(f'Fields match: {tt_fields == expected_tt}')

# 3. GET /api/engines
resp = urllib.request.urlopen(f'{base}/engines')
eng = json.loads(resp.read().decode('utf-8'))
print('\n=== Engines ===')
print(f'Top keys: {set(eng.keys())}')
eng_fields = set(eng['engines'][0].keys())
expected_eng = {'key','name','ai_platform','max_chars','format_type'}
print(f'Fields match: {eng_fields == expected_eng}')
if eng_fields != expected_eng:
    print(f'  Extra: {eng_fields - expected_eng}')
    print(f'  Missing: {expected_eng - eng_fields}')

# 4. POST /api/route
body = json.dumps({'task':'test design'}).encode('utf-8')
req = urllib.request.Request(f'{base}/route', data=body, headers={'Content-Type':'application/json'}, method='POST')
resp = urllib.request.urlopen(req)
route = json.loads(resp.read().decode('utf-8'))
print('\n=== Route ===')
route_fields = set(route.keys())
expected_route = {'task_type','task_type_name','confidence','is_manual_override','required','recommended','optional','total_chars'}
print(f'Fields match: {route_fields == expected_route}')
if route_fields != expected_route:
    print(f'  Extra: {route_fields - expected_route}')
    print(f'  Missing: {expected_route - route_fields}')

# 5. POST /api/generate
body = json.dumps({'task':'test','engine':'claude','dimensions':['A01','B01'],'priorities':{'A01':1,'B01':2}}).encode('utf-8')
req = urllib.request.Request(f'{base}/generate', data=body, headers={'Content-Type':'application/json'}, method='POST')
resp = urllib.request.urlopen(req)
gen = json.loads(resp.read().decode('utf-8'))
print('\n=== Generate ===')
gen_fields = set(gen.keys())
expected_gen = {'prompt','stats'}
print(f'Top fields match: {gen_fields == expected_gen}')
stats_fields = set(gen['stats'].keys())
expected_stats = {'total_chars','dimensions_used','dimensions_total','coverage_percent','by_level','missing_required','truncated_dimensions'}
print(f'Stats fields match: {stats_fields == expected_stats}')
if stats_fields != expected_stats:
    print(f'  Extra: {stats_fields - expected_stats}')
    print(f'  Missing: {expected_stats - stats_fields}')
bl_fields = set(gen['stats']['by_level'].keys())
expected_bl = {'required_count','recommended_count','optional_count'}
print(f'by_level fields match: {bl_fields == expected_bl}')
print(f'dimensions_total={gen["stats"]["dimensions_total"]} (contract says should be task-type specific, not system total)')

# 6. POST /api/reload
req = urllib.request.Request(f'{base}/reload', method='POST')
resp = urllib.request.urlopen(req)
rel = json.loads(resp.read().decode('utf-8'))
print('\n=== Reload ===')
rel_fields = set(rel.keys())
expected_rel = {'dimensions_count','categories_count','loaded_at'}
print(f'Fields match: {rel_fields == expected_rel}')

# Error format check
print('\n=== Error Format ===')
tests = [
    ('POST', f'{base}/route', {'task': ''}, 'empty task'),
    ('POST', f'{base}/generate', {'task':'t','engine':'gpt5','dimensions':['A01'],'priorities':{'A01':1}}, 'invalid engine'),
    ('POST', f'{base}/generate', {'task':'t','engine':'claude','dimensions':[],'priorities':{}}, 'empty dimensions'),
    ('POST', f'{base}/route', {'task':'t','task_type':'nonexistent'}, 'invalid task_type'),
]

for method, url, data, label in tests:
    try:
        body = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=body, headers={'Content-Type':'application/json'}, method=method)
        resp = urllib.request.urlopen(req)
        print(f'{label}: UNEXPECTED OK')
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode('utf-8'))
        has_error = 'error' in err_body
        has_code = 'code' in err_body.get('error', {})
        has_msg = 'message' in err_body.get('error', {})
        has_sug = 'suggestion' in err_body.get('error', {})
        code = err_body.get('error', {}).get('code', '?')
        print(f'{label}: HTTP {e.code} | code={code} | format_ok={has_error and has_code and has_msg and has_sug}')

print('\n=== All contract checks done ===')
