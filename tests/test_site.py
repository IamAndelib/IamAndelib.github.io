import re
from html.parser import HTMLParser

TEXT_EXT = {".html", ".css", ".js", ".md", ".txt", ".xml", ".json", ".svg"}
SKIP_DIRS = {".git", ".superpowers", "tests", "fonts", ".pytest_cache", "__pycache__"}

CONTACT_URLS = [
    "andelibtarefsrizon@gmail.com",
    "https://github.com/IamAndelib",
    "https://gitlab.com/IamAndelib",
    "https://www.linkedin.com/in/andelibababa/",
    "https://dev.to/better_call_sriz",
    "https://www.researchgate.net/profile/Andelib-Ababa",
    "https://www.youtube.com/@better_call_sriz",
    "https://ko-fi.com/iamandelib",
]


def read(root, name):
    return (root / name).read_text(encoding="utf-8")


class Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []      # (tag, attr, value)
        self.stars = []     # text of [data-stars] elements
        self._stack = []
        self._in_stars = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for k in ("src", "href"):
            if k in a and a[k] is not None:
                self.refs.append((tag, k, a[k], a))
        if "srcset" in a and a["srcset"]:
            for part in a["srcset"].split(","):
                self.refs.append((tag, "srcset", part.strip().split()[0], a))
        if "data-stars" in a:
            self._in_stars += 1
            self.stars.append("")
            self._stack.append(tag)
        elif self._in_stars:
            self._stack.append(tag)

    def handle_endtag(self, tag):
        if self._in_stars and self._stack and self._stack[-1] == tag:
            self._stack.pop()
            if not self._stack:
                self._in_stars = 0

    def handle_data(self, data):
        if self._in_stars:
            self.stars[-1] += data


def parse(root):
    p = Refs()
    p.feed(read(root, "index.html"))
    return p


def is_remote(u):
    return bool(re.match(r"^(https?:)?//", u))


def css_urls(css):
    return [u.strip("'\" ") for u in re.findall(r"url\(([^)]+)\)", css)]


def test_local_refs_exist(root):
    p = parse(root)
    for tag, attr, val, _ in p.refs:
        if is_remote(val) or val.startswith(("mailto:", "#", "data:", "javascript:")):
            continue
        path = val.split("#")[0].split("?")[0]
        assert (root / path).is_file(), f"<{tag} {attr}={val}> missing"
    css = read(root, "css/site.css")
    for u in css_urls(css):
        if is_remote(u) or u.startswith(("data:", "#")):
            continue
        assert ((root / "css") / u.split("?")[0]).resolve().is_file(), f"css url({u}) missing"


def test_no_third_party_assets(root):
    p = parse(root)
    for tag, attr, val, a in p.refs:
        if tag == "script" and attr == "src":
            assert not is_remote(val), val
        if tag == "img" and attr in ("src", "srcset"):
            assert not is_remote(val), val
        if tag == "link" and attr == "href" and "stylesheet" in (a.get("rel") or ""):
            assert not is_remote(val), val
    css = read(root, "css/site.css")
    assert "@import" not in css
    for u in css_urls(css):
        assert not is_remote(u), u


def load_denylist():
    import os, pathlib, pytest
    p = pathlib.Path(os.environ.get("PRIVACY_DENYLIST", "/home/thesriz/Projects/portfolio-design/privacy-denylist.txt"))
    if not p.is_file():
        pytest.skip("privacy denylist not available on this machine")
    return [l.strip() for l in p.read_text(encoding="utf-8").splitlines() if l.strip()]


def test_privacy(root):
    banned = load_denylist()
    checked = 0
    for f in root.rglob("*"):
        rel = f.relative_to(root)
        if not f.is_file() or set(rel.parts) & SKIP_DIRS or f.suffix.lower() not in TEXT_EXT:
            continue
        text = f.read_text(encoding="utf-8", errors="ignore")
        checked += 1
        for b in banned:
            assert b.lower() not in text.lower(), f"{b!r} found in {rel}"
    assert checked >= 3


def test_content_without_js(root):
    html = read(root, "index.html")
    needed = ["Tally", "Tessera", "KPeek", "Rise 360", "13,000", "Coleoptera", "Shannon",
              "Kdenlive", "DaVinci Resolve", "IELTS", "Daedalus English Academy",
              "Senior IELTS Instructor", "Ouroboros", "cosmic puzzle",
              "https://www.royalroad.com/fiction/163082/ouroboros",
              "https://www.pinterest.com/better_call_sriz/"] + CONTACT_URLS
    for n in needed:
        assert n in html, n
    for sec in "whoami projects work research writing skills education afk contact".split():
        assert f'id="{sec}"' in html, sec
    assert 'id="writing-list"' in html
    assert html.count("data-repo=") >= 1


def test_project_names(root):
    html = read(root, "index.html")
    names = re.findall(r'<article class="card" data-repo="[^"]+">\s*<div class="card-top"><h3><a [^>]*>([^<]+)</a>', html)
    assert len(names) == 7, names
    for n in names:
        assert n in html


def test_zero_stars_never_baked(root):
    for s in parse(root).stars:
        assert s.strip() != "0"


def test_reduced_motion_rules(root):
    css = read(root, "css/site.css")
    m = re.search(r"@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{", css)
    assert m, "no reduced-motion block"
    depth, i = 1, m.end()
    while depth and i < len(css):
        depth += {"{": 1, "}": -1}.get(css[i], 0)
        i += 1
    block = css[m.end():i]
    assert re.search(r"animation(-duration)?\s*:\s*(none|0)", block)
    assert "#rain" in block and "display:none" in block.replace(" ", "")


def test_skins_defined(root):
    css = read(root, "css/site.css")
    for skin in ("dark", "light", "matrix", "vt320"):
        m = re.search(r'\[data-skin="%s"\]\s*\{([^}]*)\}' % skin, css)
        assert m, skin
        # the demo's token names are --bg / --fg (values are what is binding)
        assert re.search(r"--bg:", m.group(1)) and re.search(r"--fg:", m.group(1)), skin
    assert "prefers-color-scheme: light" in css
