# -*- coding: utf-8 -*-
"""Audit script for Liz interface project (vanilla HTML/CSS/JS)."""
import os, re, json

ROOT = os.path.dirname(os.path.abspath(__file__))
SKIP_DIRS = {'.git', 'node_modules'}
EXTS = {'.html', '.css', '.js', '.md', '.svg', '.json', '.png', '.jpg', '.webp', '.ico', '.txt'}

# ---------- 1. Full file inventory ----------
all_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for f in filenames:
        rel = os.path.relpath(os.path.join(dirpath, f), ROOT).replace('\\', '/')
        all_files.append(rel)
all_files.sort()
print("=== 1. INVENTORY (%d files) ===" % len(all_files))
for f in all_files:
    print("  " + f)

# ---------- helpers ----------
def read(p):
    try:
        with open(p, encoding='utf-8', errors='replace') as fh:
            return fh.read()
    except Exception as e:
        return ""

def refs_in(html):
    """Return (css_refs, js_src_refs, img_refs) with query strings stripped."""
    css = [m.group(1).split('?')[0] for m in re.finditer(r'<link[^>]+href="([^"]+)"', html)]
    # script src only (not img src)
    js = [m.group(1).split('?')[0] for m in re.finditer(r'<script[^>]+src="([^"]+)"', html)]
    imgs = [m.group(1).split('?')[0] for m in re.finditer(r'<img[^>]+src="([^"]+)"', html)]
    return css, js, imgs

# ---------- 2. Entry point reference checks ----------
print("\n=== 2. ENTRY POINT REFERENCES ===")
all_js_content = ""
for entry in ['index.html', 'mobile/index.html']:
    p = os.path.join(ROOT, entry.replace('/', os.sep))
    if not os.path.exists(p):
        print("  [MISSING ENTRY] " + entry)
        continue
    html = read(p)
    base = os.path.dirname(p)
    css, js, imgs = refs_in(html)
    print("\n--- %s ---" % entry)
    for ref in css + js + imgs:
        if ref.startswith(('http', 'data:')):
            print("  (external) " + ref)
            continue
        target = os.path.normpath(os.path.join(base, ref))
        mark = "OK " if os.path.exists(target) else "MISSING"
        print("  [%s] %s" % (mark, ref))
    # redirect check
    for m in re.finditer(r'(intercell|mobile|redirect|location\.href|matchMedia)', html):
        pass
    redir = re.findall(r'.{0,60}(?:intercell|location\.replace|location\.href|matchMedia).{0,80}', html)
    if redir:
        print("  redirect-ish lines:")
        for r in redir[:6]:
            print("    | " + r.strip().replace('\n', ' '))
    for j in js:
        jp = os.path.normpath(os.path.join(base, j))
        if os.path.exists(jp):
            all_js_content += read(jp) + "\n"

# also gather desktop js for id greps regardless of entry parse
for jf in [f for f in all_files if f.startswith('js/') and f.endswith('.js')] + \
          [f for f in all_files if f.startswith('mobile/js/') and f.endswith('.js')]:
    all_js_content += read(os.path.join(ROOT, jf.replace('/', os.sep))) + "\n"

# ---------- 3. Missing-ID triage ----------
print("\n=== 3. MISSING-ID TRIAGE ===")
missing_ids = [
    'typing-indicator','main-float-panel','settings-code-font','settings-enter-send',
    'settings-language','settings-history-count','settings-files-count','memory-bar-fill',
    'memory-used-text','settings-cache-conversations','settings-cache-images','settings-cache-files',
    'user-name-input','settings-email-input','account-name-display','upload-panel',
    'upload-panel-overlay','mural-viewer','mural-reader-text','mural-reader','mural-context',
]
for i in missing_ids:
    hits = [m for m in re.finditer(re.escape(i), all_js_content)]
    if hits:
        # find how it is produced
        ctx = []
        for h in hits[:3]:
            s = max(0, h.start()-45)
            ctx.append(all_js_content[s:h.end()+25].replace('\n', ' '))
        print("  [#%s] %d JS hit(s) — likely dynamic:" % (i, len(hits)))
        for c in ctx:
            print("      " + c.strip())
    else:
        # search html + css too
        found_in = []
        for f in all_files:
            if f.endswith(('.html', '.css')):
                if i in read(os.path.join(ROOT, f.replace('/', os.sep))):
                    found_in.append(f)
        if found_in:
            print("  [#%s] not in JS, but in: %s" % (i, ', '.join(found_in)))
        else:
            print("  [#%s] *** TRULY MISSING — nowhere in project ***" % i)

# ---------- 4. Orphan detection ----------
print("\n=== 4. ORPHANS (files never referenced) ===")
referenced = set()
for f in all_files:
    if f.endswith('.html'):
        html = read(os.path.join(ROOT, f.replace('/', os.sep)))
        base = os.path.dirname(f)
        for ref in sum(refs_in(html), []):
            if ref.startswith(('http', 'data:')):
                continue
            norm = os.path.normpath(os.path.join(base, ref)).replace('\\', '/')
            referenced.add(norm)
# also string references in JS/CSS (url(...), fetch, etc.)
blob = ""
for f in all_files:
    if f.endswith(('.js', '.css')):
        blob += read(os.path.join(ROOT, f.replace('/', os.sep))) + "\n"
for f in all_files:
    if f.endswith(('.html', '.md')) or f == 'audit-liz.py':
        continue
    base = os.path.basename(f)
    if f in referenced:
        continue
    if base in blob or f in blob:
        continue
    print("  ORPHAN? " + f)

# ---------- 5. Docs present? ----------
print("\n=== 5. DOCS ===")
for d in ['../leia-me/AGENTS.md', '../leia-me/LIZ.md', '../leia-me/ROADMAP.md', '../leia-me/CODE_STYLE.md',
          '../leia-me/UI_GUIDELINES.md', '../leia-me/BACKUP.md', '../AGENTS.md', '../CLAUDE.md']:
    print("  [%s] %s" % ("OK " if os.path.exists(os.path.join(ROOT, d.replace('/', os.sep))) else "MISSING", d))
print("\nDONE")
