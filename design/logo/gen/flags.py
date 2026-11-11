# Génère la page du logo « mosaïque de drapeaux ». Drapeaux dessinés en 30 × 20.
F = {
 "uk": '<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.4"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6.5"/><path d="M15 0V20M0 10H30" stroke="#C8102E" stroke-width="3.6"/>',
 "us": '<rect width="30" height="20" fill="#fff"/><g fill="#B22234"><rect width="30" height="2.86"/><rect y="5.71" width="30" height="2.86"/><rect y="11.43" width="30" height="2.86"/><rect y="17.14" width="30" height="2.86"/></g><rect width="13" height="11.4" fill="#3C3B6E"/><g fill="#fff"><circle cx="3" cy="3" r=".9"/><circle cx="6.5" cy="3" r=".9"/><circle cx="10" cy="3" r=".9"/><circle cx="4.7" cy="5.7" r=".9"/><circle cx="8.3" cy="5.7" r=".9"/><circle cx="3" cy="8.4" r=".9"/><circle cx="6.5" cy="8.4" r=".9"/><circle cx="10" cy="8.4" r=".9"/></g>',
 "fr": '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#002395"/><rect x="20" width="10" height="20" fill="#ED2939"/>',
 "es": '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>',
 "cn": '<rect width="30" height="20" fill="#DE2910"/><path d="M6 2.6l1.2 3.6h3.8l-3.1 2.2 1.2 3.6L6 9.8l-3.1 2.2 1.2-3.6L1 6.2h3.8z" fill="#FFDE00"/><g fill="#FFDE00"><circle cx="12.5" cy="2.8" r=".9"/><circle cx="14.4" cy="5" r=".9"/><circle cx="14.4" cy="8" r=".9"/><circle cx="12.5" cy="10.2" r=".9"/></g>',
 "it": '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#009246"/><rect x="20" width="10" height="20" fill="#CE2B37"/>',
 "de": '<rect width="30" height="20" fill="#FFCE00"/><rect width="30" height="6.67" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#DD0000"/>',
 "jp": '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#BC002D"/>',
 "br": '<rect width="30" height="20" fill="#009C3B"/><path d="M15 2.2L27.5 10 15 17.8 2.5 10z" fill="#FFDF00"/><circle cx="15" cy="10" r="4.6" fill="#002776"/>',
 "ie": '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#169B62"/><rect x="20" width="10" height="20" fill="#FF883E"/>',
 "nl": '<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.67" fill="#AE1C28"/><rect y="13.33" width="30" height="6.67" fill="#21468B"/>',
 "se": '<rect width="30" height="20" fill="#006AA7"/><rect x="9" width="4" height="20" fill="#FECC02"/><rect y="8" width="30" height="4" fill="#FECC02"/>',
}
ORDER = ["uk", "fr", "us", "es", "cn", "it", "de", "jp", "br", "ie", "nl", "se"]
N = len(ORDER)
FW, FH, GX, GY = 20, 13.33, 6, 5
CW, CH = FW + GX, FH + GY

defs = []
for k, body in F.items():
    defs.append(f'<symbol id="f-{k}" viewBox="0 0 30 20" preserveAspectRatio="none"><g>{body}</g><rect width="30" height="20" fill="url(#folds)"/></symbol>')

def pattern(lean):
    """Grille régulière. Le drapeau d'une case dépend de (colonne - rangée) : diagonales de même pays,
    et le motif se répète exactement quand il glisse d'une case en diagonale."""
    cells = []
    for r in range(-5, 10):
        for c in range(-5, 10):
            k = ORDER[(c - r) % N]
            x, y = c * CW, r * CH
            t = f' transform="translate({x:.2f} {y:.2f}) skewX({lean})"' if lean else f' transform="translate({x:.2f} {y:.2f})"'
            cells.append(f'<use href="#f-{k}" width="{FW}" height="{FH}"{t}/>')
    return "".join(cells)

def icon(sym_id, bg, rot, lean):
    return (f'<symbol id="{sym_id}" viewBox="0 0 100 100"><clipPath id="clip-{sym_id}"><rect width="100" height="100" rx="23"/></clipPath>'
            f'<rect width="100" height="100" rx="23" fill="{bg}"/>'
            f'<g clip-path="url(#clip-{sym_id})"><g transform="translate(50 50) rotate({rot})"><g class="drift" filter="url(#lift)">{pattern(lean)}</g></g></g></symbol>')

BG = "#8FB0FA"
icons = icon("ic-diag", BG, 24, 0) + icon("ic-lean", BG, 0, 14)

html = open("gen/template.html").read()
html = html.replace("{{DEFS}}", "".join(defs) + icons)
open("logo-mosaique.html", "w").write(html)
print("ok", len(html))
