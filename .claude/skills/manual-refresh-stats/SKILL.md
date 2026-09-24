---
name: manual-refresh-stats
description: Refresh earlduque.com's social stats without Buzzlytics — reads lifetime views, likes and followers straight from Instagram, TikTok, Facebook and YouTube Studio in Chrome (user must be logged in), rewrites overall-stats.md, updates the stats banner in index.html, commits, and pushes. Use when Buzzlytics is paywalled/unavailable, or when the user asks for a manual/native-dashboard stats refresh.
---

# Refreshing social stats from the native dashboards

Same deliverable as `/refresh-stats` (`overall-stats.md` + the `stats-banner` in `index.html`), different source. Buzzlytics locked its All Time filter behind a paid plan on 2026-09-21; this route reads each platform directly. The site only shows three numbers — **views, likes, followers** — so those (plus video count and top video) are the priority. The other table rows (comments, engagement rate, watch time, median/average, sponsored value, Buzz Rank) are not available lifetime from the native dashboards; leave them at their last Buzzlytics values and keep the `†` marker on those rows.

Everything below was verified working on 2026-09-21. The user must already be signed in to each platform in Chrome.

## Setup

1. Load the browser tools in one `ToolSearch`: `tabs_context_mcp, navigate, computer, get_page_text, find, javascript_tool, browser_batch, tabs_close_mcp`.
2. `tabs_context_mcp` with `createIfEmpty: true`; use that one tab for everything.
3. `javascript_tool` calls time out at **45s**, but the loop keeps running in the page. If a call times out, wait a few seconds and re-read the `window.__x` map — don't restart the loop.

Shared helper, used on every platform:

```js
const parse = t => { t=t.trim(); const m=parseFloat(t.replace(/[^0-9.,]/g,'').replace(/,/g,'')); return /M$/.test(t)?m*1e6:/K$/.test(t)?m*1e3:m; };
```

## 1. TikTok — public profile (exact followers/likes, summed views)

Navigate to `https://www.tiktok.com/@earlioessen`, wait ~6s.

**Exact followers, likes, video count** from the hydration JSON:

```js
JSON.parse(document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__').textContent)
  .__DEFAULT_SCOPE__['webapp.user-detail'].userInfo.statsV2
// -> { followerCount, heartCount, videoCount } as exact strings
```

**Lifetime views** — scroll the grid to the bottom and sum the tiles. The grid is not virtualized, but as of 2026-09-23 `window.scrollTo`/`scrollBy` no longer trigger loading more tiles — use real wheel scrolls (`computer` scroll, 10 ticks, ~2s wait, repeated in a `browser_batch`) until the item count stops growing, then run only the summing part below:

```js
for (let i=0;i<40;i++){ window.scrollTo(0,document.body.scrollHeight); await new Promise(r=>setTimeout(r,1200)); }
const seen=new Map();
[...document.querySelectorAll('[data-e2e="user-post-item"]')].forEach(el=>{const a=el.querySelector('a'); const v=el.querySelector('[data-e2e="video-views"]'); if(a&&!seen.has(a.href)) seen.set(a.href, v?parse(v.textContent):0);});
({count: seen.size, total: [...seen.values()].reduce((a,b)=>a+b,0), top: Math.max(...seen.values())})
```

Tile counts are rounded (K/M), so the total is ±~2%. Grid count can exceed `videoCount` slightly; report the grid count.

Not useful: TikTok Studio analytics (`/tiktokstudio/analytics/overview`) only offers 7/28/60/365 days + a calendar — no lifetime.

## 2. Instagram — reels grid + per-reel fetch

**Followers:** `https://www.instagram.com/earlioessen/` — the `title` attribute on the follower count is rounded (e.g. `34,400`). Instagram Insights shows the same rounded value. Good enough for the banner.

**Lifetime views:** `https://www.instagram.com/earlioessen/reels/`. The grid is **virtualized** (only ~40 anchors in the DOM) and `scrollTo(bottom)` does not load more — step-scroll and accumulate:

```js
window.__ig = new Map();
const grab=()=>[...document.querySelectorAll('a[href*="/reel/"]')].forEach(a=>{ const t=a.innerText.trim().split('\n').filter(Boolean)[0]; if(t) window.__ig.set(a.href, parse(t)); });
window.scrollTo(0,0); await new Promise(r=>setTimeout(r,1500)); grab();
let stall=0,last=0;
for (let i=0;i<200;i++){ window.scrollBy(0,600); await new Promise(r=>setTimeout(r,900)); grab(); if(window.__ig.size===last){ if(++stall>=12) break;} else stall=0; last=window.__ig.size; }
({count: window.__ig.size, total: [...window.__ig.values()].reduce((a,b)=>a+b,0)})
```

Expect the count to match the profile's post count (~142). If it stops at 40, the loop broke early — rerun.

**Lifetime likes (and comments):** each reel page's `og:description` reads `"220K likes, 1,643 comments - ..."`. Fetch them same-origin from the page context, **40 per call** (stays under the 45s timeout), keeping results in `window.__igLikes`:

```js
window.__igLikes = window.__igLikes || new Map();
const hrefs=[...window.__ig.keys()].filter(h=>!window.__igLikes.has(h)).slice(0,40);
for (const h of hrefs){ const html=await fetch(h,{credentials:'include'}).then(r=>r.text()); const d=(html.match(/<meta property="og:description" content="([^"]*)"/)||[])[1]||''; const lm=d.match(/([\d.,]+[KM]?) likes/), cm=d.match(/([\d.,]+[KM]?) comments/); window.__igLikes.set(h,{likes: lm?parse(lm[1]):null, comments: cm?parse(cm[1]):null, ok: !!lm}); await new Promise(r=>setTimeout(r,400)); }
const v=[...window.__igLikes.values()]; ({done: window.__igLikes.size, failed: v.filter(x=>!x.ok).length, likes: v.reduce((a,b)=>a+(b.likes||0),0)})
```

Repeat until `done` equals the reel count. Don't navigate away between calls or `window.__ig` is lost.

Not useful: IG Insights (`/accounts/insights/?timeframe=30`, Content at `/accounts/insights/content/?...&timeframe=30`) caps at 90 days; `timeframe=730` snaps back to 30.

## 3. Facebook — Professional dashboard (exact, lifetime)

**Exact followers:** `https://www.facebook.com/professional_dashboard/profile_insights/audience` → `get_page_text` → `"14,652 Total followers"`.

**Lifetime views / engagement / comments per post:** the Content Library with the Lifetime range:

`https://www.facebook.com/professional_dashboard/content/content_library/?date_range=LIFETIME&filter=PUBLISHED&placement_type=ALL&post_type=ALL_CONTENT&sort_by=DATE&sorting_method=METRICS_DESCENDING`

(If the URL params don't stick: Content → Content Library → date dropdown → **Lifetime** → Apply.) Columns are `Preview, Views, Viewers, Engagement, Earnings, Net follows, Impressions, Comments, …` — there is **no Reactions column**. The table is virtualized (~11 rows in the DOM); accumulate while scrolling:

```js
const num=t=>parseFloat((t||'').replace(/[^0-9.]/g,''))||0;
window.__fbc=new Map();
const grab=()=>[...document.querySelectorAll('[role="row"]')].slice(1).forEach(r=>{const c=[...r.querySelectorAll('[role="cell"],[role="gridcell"]')].map(x=>x.innerText.trim()); if(c.length<10||!c[1]) return; window.__fbc.set(c[1],{views:num(c[3]),eng:num(c[5]),comments:num(c[9])});});
grab(); let el=document.querySelector('[role="row"]'), sc=null; while(el){ const s=getComputedStyle(el); if(/(auto|scroll)/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+50){sc=el;break;} el=el.parentElement; }
let stall=0,last=0;
for(let i=0;i<150;i++){ if(sc) sc.scrollTop+=500; window.scrollBy(0,500); await new Promise(r=>setTimeout(r,700)); grab(); if(window.__fbc.size===last){ if(++stall>=10) break;} else stall=0; last=window.__fbc.size; }
const v=[...window.__fbc.values()]; ({count:v.length, views:v.reduce((a,b)=>a+b.views,0), eng:v.reduce((a,b)=>a+b.eng,0), comments:v.reduce((a,b)=>a+b.comments,0)})
```

This one usually hits the 45s timeout — wait ~8s and re-read `window.__fbc`. Expect ~74 rows (reels plus a couple of posts).

**Likes are derived:** Engagement = reactions + comments + shares. Take the shares share from Insights → Engagement ("By interaction type", ~4%): `likes ≈ eng − comments − 0.04·eng`. Write it with a `~` and say so in the notes.

Fallback for views only: `https://www.facebook.com/earlioessen/reels/`, tiles are `a[aria-label="Reel tile preview"]` with rounded view text — same accumulate loop. Content Library is better (exact).

## 4. YouTube Shorts — YouTube Studio (cleanest source)

`studio.youtube.com` opens on Earl's personal channel. Switch: avatar (top-right) → **Switch account** → **ServiceNow Dev Program**. Then navigate to:

`https://studio.youtube.com/channel/UCdXorgCT87YlFRN9n8oJ7_A/analytics/tab-content/period-lifetime`

It takes ~15s to render. Click the **Shorts** chip under the Overview/Content tabs, then `get_page_text`: Views, Likes, Subscribers (lifetime), Top Shorts with views. The "Published content" block on the All view gives the Shorts count. Values are rounded to 0.1M/0.1K.

Followers stay `(shared account)` and are excluded from the combined total.

## 5. LinkedIn

Navigate to `https://www.linkedin.com/in/earlduque/` and read the follower count from the profile (`get_page_text`, look for `N followers`). Don't ask the user for it.

## 6. Write the files

Same rules as `/refresh-stats` step 2–3, plus:

- Caption: today's date, say the numbers came from the native dashboards and are lifetime on every platform (Facebook included). Keep the `†` marker and its explanation for rows that weren't refreshed.
- Followers total = Instagram + TikTok + Facebook + LinkedIn, summed from exact counts where available.
- Keep a short **Notes on sources** section: FB likes derived, IG/TT tile rounding, and anything that changed definition (e.g. a 90-day → lifetime move) so a jump isn't misread as growth.
- Banner: views/likes one decimal in M, followers to the nearest K.

## 7. Verify, commit, push

As in `/refresh-stats` step 4: re-add each summed row by hand, check the banner against the Total column, `git status`, stage only `overall-stats.md` and `index.html`, commit `Refresh social stats through YYYY-MM-DD` with old → new totals in the body, push. Close the tab when done.

Stop and ask if: a platform shows a login page, a scrape count is far off the profile's post count, or any total drops noticeably.
