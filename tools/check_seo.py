from pathlib import Path
from html.parser import HTMLParser
import json
import re
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent.parent
class Check(HTMLParser):
    def __init__(self): super().__init__(); self.tags=[]; self.h1=0; self.ids=set(); self.links=[]; self.scripts=[]; self.canon=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append(tag)
        if tag=='h1': self.h1+=1
        if 'id' in a: assert a['id'] not in self.ids, a['id']; self.ids.add(a['id'])
        if tag=='a' and 'href' in a: self.links.append(a['href'])
        if tag=='script' and 'src' in a: self.scripts.append(a['src'])
        if tag=='link' and a.get('rel')=='canonical': self.canon.append(a.get('href'))
        if tag=='link' and a.get('rel')=='stylesheet' and a.get('href'): self.scripts.append(a['href'])
for file in ['index.html','chinese-zodiac/index.html','chinese-zodiac/year-of-the-horse-2026/index.html','courtesy-name-generator/index.html','japanese-name-to-chinese-name/index.html','what-is-a-chinese-courtesy-name/index.html','how-to-choose-a-chinese-courtesy-name/index.html','chinese-name-vs-courtesy-name/index.html']:
    p=Check(); p.feed((ROOT/file).read_text(encoding='utf8')); assert p.h1==1, file; assert p.canon, file
    text=(ROOT/file).read_text(encoding='utf8')
    for data in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S): json.loads(data)
    assert '<meta name="description"' in text
    assert len(p.canon)==1
    for href in p.links+p.scripts:
        url=urlsplit(href)
        if url.scheme or url.netloc: continue
        if url.path.startswith('/_vercel/'): continue
        target=ROOT/url.path.lstrip('/') if url.path.startswith('/') else (ROOT/file).parent/url.path
        if not url.path: target=ROOT/file
        if target.is_dir(): target=target/'index.html'
        assert target.exists(), (file,href)
        if url.fragment:
            dest=Check(); dest.feed(target.read_text(encoding='utf8')); assert url.fragment in dest.ids, (file,href)
    print('PASS', file)
for path in ['chinese-zodiac/index.html','chinese-zodiac/year-of-the-horse-2026/index.html']:
    text=(ROOT/path).read_text(encoding='utf8'); assert text.count('data-culture-link') >= 2
z=json.loads((ROOT/'zodiac-new-years.json').read_text(encoding='utf8')); assert len(z)==201 and z['2026']=='02-17' and z['2027']=='02-06'
urls=[node.text for node in ET.parse(ROOT/'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert urls==['https://chinesename.cc.cd/','https://chinesename.cc.cd/chinese-zodiac/','https://chinesename.cc.cd/chinese-zodiac/year-of-the-horse-2026/','https://chinesename.cc.cd/courtesy-name-generator/','https://chinesename.cc.cd/japanese-name-to-chinese-name/','https://chinesename.cc.cd/what-is-a-chinese-courtesy-name/','https://chinesename.cc.cd/how-to-choose-a-chinese-courtesy-name/','https://chinesename.cc.cd/chinese-name-vs-courtesy-name/']
print('PASS SEO metadata, headings, links, sitemap and zodiac dataset')
