# Exporte le logo définitif (version 1) en SVG autonomes, à transformer ensuite en PNG.
import math, re
src = open("gen/flags6.py").read()
ns = {}
exec(src.split("def icon(")[0], ns)          # F, ORDER, LEAN, RATIO, DENSITY, defs
F, ORDER, LEAN, RATIO, DENSITY = ns["F"], ns["ORDER"], ns["LEAN"], ns["RATIO"], ns["DENSITY"]

GX = 11
fw = (100 / DENSITY[9]) * 0.73
cw = fw + GX
fh = fw * RATIO; ch = fh + GX * 1.08
lean_dx = math.tan(math.radians(LEAN)) * fh
x0 = (50 - (fw + lean_dx) / 2 + cw / 2) % cw - cw
y0 = (50 - fh / 2 + ch / 2) % ch - ch

# 1) Les pays exactement comme dans le logo validé (mêmes règles de visibilité).
chosen, used = {}, 0
r = 0
while y0 + r * ch < 100:
    c = 0
    while x0 + c * cw < 100 + lean_dx:
        x, y = x0 + c * cw, y0 + r * ch
        vis_w = min(x + fw + lean_dx, 100) - max(x, 0)
        vis_h = min(y + fh, 100) - max(y, 0)
        cx, cy = min(max(x + fw / 2, 0), 100), min(max(y + fh / 2, 0), 100)
        in_corner = (min(cx, 100 - cx) < 9) and (min(cy, 100 - cy) < 9)
        if vis_w > fw * 0.15 and vis_h > fh * 0.2 and not in_corner:
            chosen[(r, c)] = ORDER[used]; used += 1
        c += 1
    r += 1
import itertools
# Hors du cadre visible, les pays restants peuvent revenir : cette zone est cachée par le masque du téléphone.
spare = itertools.cycle(ORDER[used:])

def cells(lo, hi, fill_all):
    """Cases qui touchent [lo, hi]². Les cases du logo validé gardent leur pays ;
    les autres (coins, zone élargie d'Android) reçoivent des pays encore inutilisés."""
    out = []
    for r in range(-4, 9):
        for c in range(-4, 9):
            x, y = x0 + c * cw, y0 + r * ch
            if x + fw + lean_dx < lo or x > hi or y + fh < lo or y > hi:
                continue
            if (r, c) in chosen:
                k = chosen[(r, c)]
            elif fill_all:
                if (r, c) not in extra: extra[(r, c)] = next(spare)
                k = extra[(r, c)]
            else:
                continue
            out.append((x, y, k))
    return out
extra = {}

STYLE_DEFS = ('<defs><linearGradient id="folds" x1="0" x2="1" y1="0" y2="0">'
    '<stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>'
    '<stop offset=".6" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>'
    '<filter id="lift" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy=".9" stdDeviation=".8" flood-color="#0b1a4a" flood-opacity=".25"/></filter>'
    '<clipPath id="round"><rect width="30" height="20" rx="4.5"/></clipPath>'
    + "".join(f'<symbol id="f-{k}" viewBox="0 0 30 20" preserveAspectRatio="none"><g clip-path="url(#round)">{b}<rect width="30" height="20" fill="url(#folds)"/></g></symbol>' for k, b in F.items())
    + '</defs>')

def flags_svg(items, mono=False):
    out = []
    for x, y, k in items:
        if mono:
            out.append(f'<g transform="translate({x:.2f} {y:.2f}) skewX({LEAN})"><rect width="{fw:.2f}" height="{fh:.2f}" rx="{fw*4.5/30:.2f}" fill="#fff"/></g>')
        else:
            out.append(f'<g transform="translate({x:.2f} {y:.2f}) skewX({LEAN})"><use href="#f-{k}" width="{fw:.2f}" height="{fh:.2f}"/></g>')
    return "".join(out)

BLUE = "#8FB0FA"
def doc(viewbox, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="{viewbox}" width="1024" height="1024">{STYLE_DEFS}{body}</svg>'

files = {
  # iPhone et icône générale : carré plein, sans coins arrondis ni transparence (le système arrondit lui-même).
  "icon": doc("0 0 100 100", f'<rect width="100" height="100" fill="{BLUE}"/><g filter="url(#lift)">{flags_svg(cells(0, 100, True))}</g>'),
  # Logo arrondi (écran de Bienvenue, écran de démarrage, favicon).
  "logo": doc("0 0 100 100", f'<clipPath id="r"><rect width="100" height="100" rx="23"/></clipPath><rect width="100" height="100" rx="23" fill="{BLUE}"/><g clip-path="url(#r)" filter="url(#lift)">{flags_svg(cells(0, 100, False))}</g>'),
  # Android : premier plan sur fond transparent, zone élargie (le lanceur n'en montre que le centre).
  "android-fg": doc("-25 -25 150 150", f'<g filter="url(#lift)">{flags_svg(cells(-25, 125, True))}</g>'),
  "android-mono": doc("-25 -25 150 150", flags_svg(cells(-25, 125, True), mono=True)),
}
for name, svg in files.items():
    open(f"gen/{name}.svg", "w").write(svg)
print("pays du logo :", [chosen[k] for k in sorted(chosen)])
print("pays ajoutés hors cadre :", sorted(set(extra.values())))
