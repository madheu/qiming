from pathlib import Path
from html.parser import HTMLParser
import json
import re
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent.parent
BASE = 'https://chinesename.cc.cd'
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'

PAGES = [
    'index.html',
    'chinese-zodiac/index.html',
    'chinese-zodiac/year-of-the-horse-2026/index.html',
    'courtesy-name-generator/index.html',
    'japanese-name-to-chinese-name/index.html',
    'what-is-a-chinese-courtesy-name/index.html',
    'english-to-chinese-name/index.html',
    'chinese-surnames/index.html',
    'bazi/index.html',
    'chinese-names-with-meaning/index.html',
    'what-is-my-chinese-name/index.html',
]
REDIRECTED = {
    '/how-to-choose-a-chinese-courtesy-name': '/what-is-a-chinese-courtesy-name/',
    '/chinese-name-vs-courtesy-name': '/what-is-a-chinese-courtesy-name/',
}


class Check(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.h1 = 0
        self.ids = set()
        self.links = []
        self.scripts = []
        self.canon = []
        self.breadcrumbs = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append(tag)
        if tag == 'h1':
            self.h1 += 1
        if 'id' in a:
            assert a['id'] not in self.ids, a['id']
            self.ids.add(a['id'])
        if tag == 'a' and 'href' in a:
            self.links.append(a['href'])
        if tag == 'script' and 'src' in a:
            self.scripts.append(a['src'])
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canon.append(a.get('href'))
        if tag == 'link' and a.get('rel') == 'stylesheet' and a.get('href'):
            self.scripts.append(a['href'])
        if tag == 'nav' and 'breadcrumbs' in (a.get('class') or ''):
            self.breadcrumbs += 1


def parse(path):
    p = Check()
    p.feed((ROOT / path).read_text(encoding='utf8'))
    return p


def resolve(file, href):
    url = urlsplit(href)
    if url.scheme or url.netloc:
        return None
    if url.path.startswith('/_vercel/'):
        return None
    target = ROOT / url.path.lstrip('/') if url.path.startswith('/') else (ROOT / file).parent / url.path
    if not url.path:
        target = ROOT / file
    if target.is_dir():
        target = target / 'index.html'
    assert target.exists(), (file, href)
    if url.fragment:
        assert url.fragment in parse(str(target.relative_to(ROOT))).ids, (file, href)
    return target


def jsonld_blocks(text):
    return [json.loads(b) for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)]


for file in PAGES:
    text = (ROOT / file).read_text(encoding='utf8')
    p = parse(file)
    assert p.h1 == 1, file
    assert len(p.canon) == 1, file
    assert '<meta name="description"' in text, file
    schemas = jsonld_blocks(text)
    assert schemas, file
    for href in p.links + p.scripts:
        resolve(file, href)
    if file != 'index.html':
        assert p.breadcrumbs == 1, file
        assert any(s.get('@type') == 'BreadcrumbList' for s in schemas), file
    print('PASS', file)

# Homepage targets the head keyword first; the brand goes last.
home = (ROOT / 'index.html').read_text(encoding='utf8')
assert '<title>Chinese Name Generator' in home
assert any(s.get('@type') == 'FAQPage' for s in jsonld_blocks(home))
pillar = (ROOT / 'what-is-a-chinese-courtesy-name/index.html').read_text(encoding='utf8')
assert any(s.get('@type') == 'FAQPage' for s in jsonld_blocks(pillar))
assert 'id="zi"' in pillar

# The courtesy-name cluster is one pillar page now; the thin pages are gone.
for gone in REDIRECTED:
    assert not (ROOT / gone.lstrip('/')).exists(), gone

redirects = json.loads((ROOT / 'vercel.json').read_text(encoding='utf8'))['redirects']
sources = {r['source'].rstrip('/') for r in redirects}
assert sources == set(REDIRECTED), sources
for source, destination in REDIRECTED.items():
    assert any(r['source'].rstrip('/') == source and r['destination'] == destination and r['permanent'] for r in redirects), source
    assert (ROOT / destination.lstrip('/') / 'index.html').exists(), destination

# llms.txt must tell an agent when to use the site and how to reach it.
llms = (ROOT / 'llms.txt').read_text(encoding='utf8')
assert '## When to use' in llms and '## How to call' in llms, 'llms.txt'

# Share cards are user-generated URLs and must stay out of the index.
share = (ROOT / 'share/index.html').read_text(encoding='utf8')
assert 'name="robots" content="noindex"' in share

for path in ['chinese-zodiac/index.html', 'chinese-zodiac/year-of-the-horse-2026/index.html']:
    text = (ROOT / path).read_text(encoding='utf8')
    assert text.count('data-culture-link') >= 2

z = json.loads((ROOT / 'zodiac-new-years.json').read_text(encoding='utf8'))
assert len(z) == 201 and z['2026'] == '02-17' and z['2027'] == '02-06'

locs = [node.text for node in ET.parse(ROOT / 'sitemap.xml').findall('.//' + NS + 'loc')]
assert locs == [
    BASE + '/',
    BASE + '/chinese-zodiac/',
    BASE + '/chinese-zodiac/year-of-the-horse-2026/',
    BASE + '/courtesy-name-generator/',
    BASE + '/japanese-name-to-chinese-name/',
    BASE + '/what-is-a-chinese-courtesy-name/',
    BASE + '/english-to-chinese-name/',
    BASE + '/chinese-surnames/',
    BASE + '/bazi/',
    BASE + '/chinese-names-with-meaning/',
    BASE + '/what-is-my-chinese-name/',
], locs
for url in ET.parse(ROOT / 'sitemap.xml').findall('.//' + NS + 'url'):
    assert url.find(NS + 'lastmod') is not None, url.find(NS + 'loc').text

print('PASS SEO metadata, headings, links, breadcrumbs, redirects, llms.txt, sitemap and zodiac dataset')
