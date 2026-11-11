# Logo v3 : motif pleine icône (drapeaux coupés aux bords), rangées droites, drapeaux penchés,
# tous différents, quatre densités : « 9 » = gros drapeaux … « 12 » = petits.
src = open("gen/flags.py").read().split("ORDER =")[0]
ns = {}; exec(src, ns); F = dict(ns["F"])
F.update({
 "be": '<rect width="30" height="20" fill="#FDDA24"/><rect width="10" height="20" fill="#000"/><rect x="20" width="10" height="20" fill="#EF3340"/>',
 "at": '<rect width="30" height="20" fill="#ED2939"/><rect y="6.67" width="30" height="6.67" fill="#fff"/>',
 "pl": '<rect width="30" height="20" fill="#DC143C"/><rect width="30" height="10" fill="#fff"/>',
 "ua": '<rect width="30" height="20" fill="#FFD700"/><rect width="30" height="10" fill="#0057B7"/>',
 "dk": '<rect width="30" height="20" fill="#C8102E"/><rect x="9" width="3.5" height="20" fill="#fff"/><rect y="8.25" width="30" height="3.5" fill="#fff"/>',
 "fi": '<rect width="30" height="20" fill="#fff"/><rect x="8.5" width="5" height="20" fill="#002F6C"/><rect y="7.5" width="30" height="5" fill="#002F6C"/>',
 "no": '<rect width="30" height="20" fill="#BA0C2F"/><rect x="8" width="6" height="20" fill="#fff"/><rect y="7" width="30" height="6" fill="#fff"/><rect x="9.5" width="3" height="20" fill="#00205B"/><rect y="8.5" width="30" height="3" fill="#00205B"/>',
 "ch": '<rect width="30" height="20" fill="#DA291C"/><rect x="13" y="4" width="4" height="12" fill="#fff"/><rect x="9" y="8" width="12" height="4" fill="#fff"/>',
 "ar": '<rect width="30" height="20" fill="#74ACDF"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><circle cx="15" cy="10" r="2.2" fill="#F6B40E"/>',
 "co": '<rect width="30" height="20" fill="#CE1126"/><rect width="30" height="10" fill="#FCD116"/><rect y="10" width="30" height="5" fill="#003893"/>',
 "in": '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#FF9933"/><rect y="13.33" width="30" height="6.67" fill="#138808"/><circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" stroke-width=".8"/>',
 "tr": '<rect width="30" height="20" fill="#E30A17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#E30A17"/><path d="M17.2 10l3.4-1.1-2.1 2.9v-3.6l2.1 2.9z" fill="#fff"/>',
 "mx": '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#006847"/><rect x="20" width="10" height="20" fill="#CE1126"/><circle cx="15" cy="10" r="2.3" fill="#8C6A3E"/>',
 "sa": '<rect width="30" height="20" fill="#006C35"/><g fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round"><path d="M8 7.5c1-1.5 2 1 3 0s2-2 3 0 2 1 3-.5 2 1.5 3 0 1.5-1 2 .5"/><path d="M9 10.2c1.5-.8 3 .8 4.5 0s3-.8 4.5 0 2.5.6 3.5-.3"/></g><path d="M8.5 13.6h12.5l1.6-.7-1.6-.6H8.5z" fill="#fff"/><rect x="8" y="12.3" width="1.2" height="2.6" rx=".4" fill="#fff"/>',
 "cg": '<rect width="30" height="20" fill="#FBDE4A"/><path d="M0 0H21L0 20z" fill="#009543"/><path d="M30 0V20H9z" fill="#DC241F"/>',
 "ao": '<rect width="30" height="20" fill="#000"/><rect width="30" height="10" fill="#CC092F"/><path d="M11.6 13.2a4.2 4.2 0 1 1 6.8-2.6" fill="none" stroke="#FFCB00" stroke-width="1.3"/><path d="M12 13.4l5.6-4.8" stroke="#FFCB00" stroke-width="1.2"/><path d="M14 6.2l.5 1.4h1.5l-1.2.9.4 1.4-1.2-.9-1.2.9.4-1.4-1.2-.9h1.5z" fill="#FFCB00"/>',
 "ae": '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#00732F"/><rect y="13.33" width="30" height="6.67" fill="#000"/><rect width="8" height="20" fill="#FF0000"/>',
 "hu": '<rect width="30" height="20" fill="#436F4D"/><rect width="30" height="6.67" fill="#CD2A3E"/><rect y="6.67" width="30" height="6.67" fill="#fff"/>',
 "ro": '<rect width="30" height="20" fill="#FCD116"/><rect width="10" height="20" fill="#002B7F"/><rect x="20" width="10" height="20" fill="#CE1126"/>',
 "bg": '<rect width="30" height="20" fill="#D62612"/><rect width="30" height="6.67" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#00966E"/>',
 "cz": '<rect width="30" height="20" fill="#D7141A"/><rect width="30" height="10" fill="#fff"/><path d="M0 0L15 10 0 20z" fill="#11457E"/>',
 "ng": '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#008751"/><rect x="20" width="10" height="20" fill="#008751"/>',
 "id": '<rect width="30" height="20" fill="#fff"/><rect width="30" height="10" fill="#CE1126"/>',
 "cl": '<rect width="30" height="20" fill="#D52B1E"/><rect width="30" height="10" fill="#fff"/><rect width="10" height="10" fill="#0039A6"/><circle cx="5" cy="5" r="1.8" fill="#fff"/>',
 "lt": '<rect width="30" height="20" fill="#C1272D"/><rect width="30" height="6.67" fill="#FDB913"/><rect y="6.67" width="30" height="6.67" fill="#006A44"/>',
 "ee": '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#0072CE"/><rect y="6.67" width="30" height="6.67" fill="#000"/>',
})
# Ordre de remplissage : les drapeaux qui se ressemblent (tricolores verticaux, croix nordiques) sont espacés.
ORDER = ["uk", "jp", "br", "fr", "de", "us", "ao", "cn", "es", "it", "sa", "in", "se", "nl", "mx", "ae", "ar", "be", "tr", "co", "dk", "pl", "ie", "no", "at", "hu", "cz", "ng", "cl", "lt", "id", "ro", "ee", "bg", "ua"]

LEAN, RATIO = 12, 0.66
DENSITY = {9: 3.0, 10: 3.33, 11: 3.67, 12: 4.0}   # nombre de colonnes sur la largeur de l'icône

defs = ['<clipPath id="round"><rect width="30" height="20" rx="4.5"/></clipPath>']
for k, body in F.items():
    defs.append(f'<symbol id="f-{k}" viewBox="0 0 30 20" preserveAspectRatio="none"><g clip-path="url(#round)">{body}<rect width="30" height="20" fill="url(#folds)"/></g></symbol>')

import math
def icon(n):
    cw = 100 / DENSITY[n]
    fw = cw * 0.73; gx = cw - fw
    fh = fw * RATIO; ch = fh + gx * 1.08
    x0, y0 = -cw * 0.45, -ch * 0.35        # décalage : les drapeaux des bords sont coupés
    lean_dx = math.tan(math.radians(LEAN)) * fh
    cells, used = [], 0
    r = 0
    while y0 + r * ch < 100:
        c = 0
        while x0 + c * cw < 100 + lean_dx:
            x, y = x0 + c * cw, y0 + r * ch
            # On ne dessine que les cases qui touchent l'icône, et chacune reçoit un pays différent.
            vis_w = min(x + fw + lean_dx, 100) - max(x, 0)
            vis_h = min(y + fh, 100) - max(y, 0)
            cx, cy = min(max(x + fw / 2, 0), 100), min(max(y + fh / 2, 0), 100)
            in_corner = (min(cx, 100 - cx) < 9) and (min(cy, 100 - cy) < 9)
            if vis_w > fw * 0.18 and vis_h > fh * 0.25 and not in_corner:
                k = ORDER[used]; used += 1
                print('  ', r, c, k)
                cells.append(f'<g transform="translate({x:.2f} {y:.2f}) skewX({LEAN})"><g class="sway s{used % 5}"><use href="#f-{k}" width="{fw:.2f}" height="{fh:.2f}"/></g></g>')
            c += 1
        r += 1
    assert used <= len(ORDER), (n, used)
    print(n, "drapeaux visibles :", used)
    return (f'<symbol id="ic-{n}" viewBox="0 0 100 100"><clipPath id="clip-{n}"><rect width="100" height="100" rx="23"/></clipPath>'
            f'<rect width="100" height="100" rx="23" fill="#8FB0FA"/><g clip-path="url(#clip-{n})" filter="url(#lift)">{"".join(cells)}</g></symbol>')

def icon_gap(name, gx, centre="flag"):
    """Rangées droites, drapeaux de taille fixe (celle de la version « 9 »), espacement gx."""
    fw = (100 / DENSITY[9]) * 0.73
    cw = fw + gx
    fh = fw * RATIO; ch = fh + gx * 1.08
    lean_dx = math.tan(math.radians(LEAN)) * fh
    # Grille centrée : un drapeau au centre de l'icône, les bords coupés pareil des deux côtés.
    # centre="flag" : un drapeau au milieu ; centre="gap" : un espace au milieu (drapeaux des bords coupés à moitié).
    dx = 0 if centre == "flag" else cw / 2
    dy = 0 if centre == "flag" else ch / 2
    x0 = (50 - (fw + lean_dx) / 2 + dx) % cw - cw
    y0 = (50 - fh / 2 + dy) % ch - ch
    cells, used = [], 0
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
                k = ORDER[used]; used += 1
                print('  ', r, c, k)
                cells.append(f'<g transform="translate({x:.2f} {y:.2f}) skewX({LEAN})"><g class="sway s{used % 5}"><use href="#f-{k}" width="{fw:.2f}" height="{fh:.2f}"/></g></g>')
            c += 1
        r += 1
    print(name, "espace", gx, ":", used, "drapeaux")
    return (f'<symbol id="ic-{name}" viewBox="0 0 100 100"><clipPath id="clip-{name}"><rect width="100" height="100" rx="23"/></clipPath>'
            f'<rect width="100" height="100" rx="23" fill="#8FB0FA"/><g clip-path="url(#clip-{name})" filter="url(#lift)">{"".join(cells)}</g></symbol>')

GAPS = [("e1", 11, "gap")]
html = open("gen/template6.html").read().replace("{{DEFS}}", "".join(defs) + "".join(icon_gap(n, g, c) for n, g, c in GAPS))
open("logo-final.html", "w").write(html)
