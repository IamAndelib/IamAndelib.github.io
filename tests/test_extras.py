import re
import struct
from html.parser import HTMLParser

SITE = "https://iamandelib.github.io/"


class Meta(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.links = []
        self.all = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.all.append((tag, a))
        if tag == "meta":
            key = a.get("name") or a.get("property")
            if key:
                self.meta[key] = a.get("content", "")
        if tag == "link":
            self.links.append(a)


def parse(root, name):
    p = Meta()
    p.feed((root / name).read_text(encoding="utf-8"))
    return p


def test_meta_tags(root):
    p = parse(root, "index.html")
    assert p.meta.get("description")
    assert any(l.get("rel") == "canonical" and l.get("href") == SITE for l in p.links)
    assert p.meta.get("og:title")
    assert p.meta.get("og:description")
    assert p.meta.get("og:image") == SITE + "img/og.png"
    assert p.meta.get("twitter:card") == "summary_large_image"
    assert p.meta.get("theme-color")


def test_404_page(root):
    f = root / "404.html"
    assert f.exists()
    text = f.read_text(encoding="utf-8")
    p = parse(root, "404.html")
    hrefs = [a.get("href") for t, a in p.all if t == "a"]
    assert "/" in hrefs
    assert any((l.get("href") or "").split("?")[0] == "/css/site.css" for l in p.links)
    assert any(t == "img" and a.get("src") == "/img/frog.svg" for t, a in p.all)
    from test_site import load_denylist
    for b in load_denylist():
        assert b.lower() not in text.lower()


def test_sitemap_robots(root):
    assert f"<loc>{SITE}</loc>" in (root / "sitemap.xml").read_text()
    robots = (root / "robots.txt").read_text()
    assert re.search(r"User-agent:\s*\*", robots)
    assert re.search(r"^Allow:\s*/\s*$", robots, re.M)
    assert not re.search(r"^Disallow:\s*/\S*", robots, re.M)
    assert f"Sitemap: {SITE}sitemap.xml" in robots


def test_og_image(root):
    data = (root / "img/og.png").read_bytes()[:24]
    assert data[:8] == b"\x89PNG\r\n\x1a\n"
    w, h = struct.unpack(">II", data[16:24])
    assert (w, h) == (1200, 630)


def test_live_refresh_endpoints(root):
    js = (root / "js/site.js").read_text()
    assert "users/IamAndelib/repos" not in js
    assert "https://api.github.com/repos/IamAndelib/" in js
    assert "refreshStars" in js and "refreshArticles" in js
