#!/usr/bin/env python3
"""Verify summary-only wrappers preserve every original point and inline element."""
from pathlib import Path
from lxml import html
import subprocess
ROOT = Path(__file__).resolve().parents[1]
BASE = '962999b19cf1dbed2e6ad49046bf144a8304c760'
points = titles = plain = 0
for path in sorted(ROOT.glob('20*/index.html')):
    rel = path.relative_to(ROOT).as_posix()
    original = html.fromstring(subprocess.check_output(['git', 'show', BASE + ':' + rel], cwd=ROOT))
    current = html.fromstring(path.read_text())
    selector = '//section[contains(concat(" ", normalize-space(@class), " "), " tldr ")]'
    before, after = original.xpath(selector), current.xpath(selector)
    assert len(before) == len(after) == 1, rel
    a, b = before[0], after[0]
    assert a.text_content() == b.text_content(), (rel, 'summary text')
    for tag in ('h2', 'p', 'ol', 'ul', 'li', 'strong', 'code', 'a', 'mark'):
        old, new = a.xpath('.//' + tag), b.xpath('.//' + tag)
        assert len(old) == len(new), (rel, tag, 'count')
        assert [x.text_content() for x in old] == [x.text_content() for x in new], (rel, tag, 'text')
    old_points, new_points = a.xpath('./ol/li'), b.xpath('./ol/li')
    for old, new in zip(old_points, new_points):
        points += 1
        title = new.xpath('./span[@class="tldr-title"]')
        leading_bold = len(old) > 0 and old[0].tag == 'strong' and not (old.text or '').strip()
        assert bool(title) == leading_bold, (rel, 'lead classification')
        if leading_bold:
            titles += 1
            assert title[0].get('role') == 'heading' and title[0].get('aria-level') == '3'
            assert title[0][0].tag == 'strong'
        else:
            plain += 1
            assert len(new.xpath('./div[@class="tldr-body"]')) == 1
print(f'PASS: 30 summaries; {points} points; {titles} separate titles; {plain} plain points. Exact summary text, list counts and inline content preserved.')
