#!/usr/bin/env python3
"""Audit the editorial rewrite against the committed original (no browser needed)."""
from pathlib import Path
from lxml import html
import subprocess,re,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
BASE='962999b19cf1dbed2e6ad49046bf144a8304c760'
def tree(s):return html.fromstring(s)
def main(d):return d.xpath('//main')[0]
def text(e):return re.sub(r'\s+',' ',e.text_content()).strip()
def canonical(u):
 # Offline links explicitly name index.html; their public destinations are unchanged.
 if not u.startswith(('http:','https:')):u=re.sub(r'/index\.html(?=#|$)','/',u)
 return u
def targets(e):return [(x.tag,canonical(x.get('href') or x.get('src'))) for x in e.xpath('.//*[@href or @src]')]
report=[];errors=[]
for p in sorted(ROOT.glob('20*/index.html')):
 rel=p.relative_to(ROOT).as_posix();before=subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT).decode();after=p.read_text()
 a,b=main(tree(before)),main(tree(after))
 ok=text(a)==text(b)
 if not ok:errors.append(rel+': main text mismatch')
 if targets(a)!=targets(b):errors.append(rel+': main links/images mismatch')
 for tag in ['img','table','pre','code','figure','figcaption']:
  if [text(x) for x in a.xpath('.//'+tag)]!=[text(x) for x in b.xpath('.//'+tag)]:errors.append(rel+': '+tag+' mismatch')
 if not tree(after).xpath('//aside[@class="reading-nav"]'):errors.append(rel+': missing reader navigation')
 if re.search(r'class="rail"|href="../site.css"',after):errors.append(rel+': obsolete global layout')
 ids=tree(after).xpath('//*[@id]/@id')
 if len(ids)!=len(set(ids)):errors.append(rel+': duplicate ids')
 for el in tree(after).xpath('//*[@href or @src]'):
  u=el.get('href') or el.get('src')
  if u.startswith(('https:','http:','mailto:','data:','tel:')):continue
  target,_,fragment=u.partition('#');target=target.split('?')[0]
  dest=(p.parent/target) if target else p
  if not dest.exists():errors.append(rel+': missing '+u)
  if not target and fragment and fragment not in ids:errors.append(rel+': broken fragment '+u)
 report.append({'page':rel,'main_text_sha256':hashlib.sha256(text(b).encode()).hexdigest(),'main_text_preserved':ok,'images':len(b.xpath('.//img')),'tables':len(b.xpath('.//table')),'links':len(b.xpath('.//a'))})
# All article image bytes must remain identical to the committed original.
assets=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE],cwd=ROOT).decode().splitlines()
for rel in assets:
 if re.match(r'20[^/]+/images/',rel):
  old=subprocess.check_output(['git','show',BASE+':'+rel],cwd=ROOT)
  if not (ROOT/rel).exists() or old!=(ROOT/rel).read_bytes():errors.append(rel+': image bytes changed')
result={'baseline':BASE,'articles':len(report),'images':sum(x['images'] for x in report),'tables':sum(x['tables'] for x in report),'passed':not errors,'errors':errors,'pages':report}
(ROOT/'checks/content-preservation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='pages'},ensure_ascii=False,indent=2))
assert len(report)==30 and not errors
