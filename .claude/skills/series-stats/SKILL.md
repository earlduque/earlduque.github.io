---
name: series-stats
description: Look up the total views, likes and comments for The Accidental IT Guy series (18 episodes + the Lore Dump) on TikTok, Instagram, Facebook and YouTube Shorts, per episode and combined. Use when the user asks how the Accidental IT Guy series is doing, or for its total or per-episode numbers. Includes episodes that get uploaded to YouTube later.
---

# Accidental IT Guy series stats

This reports in chat only. It doesn't change `overall-stats.md` or the banner (that's `/refresh-stats`), and it doesn't commit. If you're running `/refresh-stats` in the same session, collect the series numbers from the same CSV exports instead of opening each profile twice.

## 1. Get the episode links

The links come from Fairbairn's upload log (`C:\Storage\GitHub\Fairbairn\upload-log.md`, kept current by Fairbairn's `/grab-links`). Run:

```
python .claude/skills/series-stats/series_links.py
```

It prints every series row: episodes `01`–`18`, plus `lore` for the *Accidental IT Guy Lore Dump*, which has no script. It also prints `ids`, a map from episode to video ID for each platform: TikTok video ID, Instagram reel shortcode, Facebook reel ID and YouTube Shorts ID. A platform the episode hasn't been uploaded to is left out. As of 2026-11-26, all 19 videos are on TikTok, Instagram and Facebook, and YouTube has episodes 01–08. Pull the repo first (`git -C C:\Storage\GitHub\Fairbairn pull`) if it might be behind.

## 2. Pull the per-video CSVs from Buzzlytics (Claude in Chrome)

Follow steps 1–5 of `.claude/skills/refresh-stats/SKILL.md` for the four profiles (Instagram Reels, TikTok, Facebook Reels, YouTube Shorts):

- If the page shows "Showing numbers from <date>", refresh the profile (1 unlock).
- Set the date filter: **All Time**, or **Last 12 Months** for Facebook.
- On the content tab, hook `URL.createObjectURL` / `HTMLAnchorElement.prototype.click` and click `button[aria-label="Export videos to CSV"]`.

Don't return the raw CSV text from `javascript_tool`: the extension blocks output that contains URLs with query strings. Parse it in the page instead, and match the series by ID against the whole row, since the `Content URL` column holds the post link on every platform:

```js
window.parseCSV=function(t){const rows=[];let r=[],f='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=ch}else{if(ch=='"')q=true;else if(ch==','){r.push(f);f=''}else if(ch=='\n'){r.push(f);rows.push(r);r=[];f=''}else if(ch!='\r')f+=ch}}if(f||r.length){r.push(f);rows.push(r)}return rows};
const S = /* paste ids.<platform> from series_links.py */ {};
const CAPTIONS = /* YouTube only: {ep: caption} for episodes with no YouTube id yet, else {} */ {};
const rows=parseCSV(window.__csv), h=rows[0], ix=k=>h.indexOf(k), d=rows.slice(1).filter(r=>r.length>5), num=x=>Number(x)||0;
const pick=r=>r&&{views:num(r[ix('Views')]),likes:num(r[ix('Likes')]),comments:num(r[ix('Comments')]),posted:r[ix('Create Time')].slice(0,10)};
const out={};
for (const [ep,id] of Object.entries(S)) out[ep]=pick(d.find(r=>r.join('|').includes(id)))||'NOT FOUND';
const norm=s=>s.toLowerCase().replace(/[“”"'’]/g,'').replace(/#.*$/,'').trim();
for (const [ep,cap] of Object.entries(CAPTIONS)) { const r=d.find(r=>norm(r[ix('Description')]).startsWith(norm(cap).slice(0,30))); if(r) out[ep]={...pick(r),matchedByCaption:true,url:r[ix('Content URL')].replace(/\?.*/,'')}; }
JSON.stringify(out)
```

**YouTube episodes not in the log yet.** Shorts uploads trail the other platforms, and the log can lag behind YouTube. For each episode with no YouTube ID, put its caption (from `series_links.py`) in `CAPTIONS`. The snippet matches it against the start of the Shorts description (the captions are the same as TikTok's). Count a caption match only when the post date is on or after the TikTok post date. Then tell the user which YouTube links were found this way, so they can log them with Fairbairn's `/grab-links`.

A `NOT FOUND` on TikTok, Instagram or Facebook usually means Buzzlytics hasn't picked up the post yet (posted today, profile not refreshed) or Facebook's 12-month window dropped it. Say so; don't count it as zero without saying so.

## 3. Report

Give the user, in chat:

1. **Series total** across the four platforms: views, likes and comments, with and without the Lore Dump. Prefix views with `~` because Facebook rounds each video to the nearest 1K.
2. **Per platform**: episode count and views, likes and comments. On YouTube, say how many of the 18 episodes are up.
3. **Per episode**: a table with episode number, short caption, views on TikTok, Instagram, Facebook and YouTube (`—` if not uploaded), and the episode total, sorted by episode number. Name the top three episodes.
4. If there's a previous snapshot in the conversation or in the user's notes, the change since then.

State the Buzzlytics snapshot time ("Public … data as of …" on each profile).

## Reference: 2026-11-26 snapshot

For comparison next time: **~8,274,441 views**, 543,263 likes, 4,284 comments across 19 videos (Lore Dump 169,184 of those views).

| Platform | Videos | Views | Likes | Comments |
| --- | --- | --- | --- | --- |
| YouTube Shorts | 8 | 3,296,866 | 179,498 | 1,728 |
| TikTok | 19 | 1,962,436 | 225,584 | 1,162 |
| Instagram | 19 | 1,699,139 | 108,237 | 732 |
| Facebook | 19 | ~1,316,000 | 29,944 | 662 |

Top episodes: 01 *Greg's Last Day* 1,765,404 · 02 *My Signature Says IT (Interim)* 1,010,670 · 03 *Room B Has Been Booked Since 2019* 862,192.
