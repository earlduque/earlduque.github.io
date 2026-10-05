---
name: refresh-stats
description: Refresh earlduque.com's social stats end-to-end — pulls fresh numbers from Buzzlytics (tiktokviewcount.com) in Chrome, rewrites the table and takeaways in overall-stats.md, updates the combined stats banner in index.html, commits, and pushes. Use whenever the user wants to update/refresh stats, follower counts, views, or the stats banner.
---

# Refreshing social stats

`overall-stats.md` holds one column per platform plus a **Total / Combined** column. The stats banner in `index.html` (the `stats-banner` section, marked `Source numbers: overall-stats.md`) shows three of those totals. Both files change together.

## 1. Collect the numbers (Claude in Chrome)

Don't count on the user's already-open tabs. The tools only see tabs inside Claude's tab group, and that group disappears if its last tab closes while the user is dragging tabs in. Open the pages yourself:

1. Call `tabs_context_mcp` with `createIfEmpty: true` and use that tab.
2. Visit each profile URL linked in the table header of `overall-stats.md`: Instagram Reels, TikTok, Facebook Reels, YouTube Shorts. Pages take ~10–20s to load; the first screenshot is often blank.
3. **Refresh stale profiles.** If a yellow banner says "Showing numbers from <date>", click **Refresh · 1 search** (top right of the banner), then **Confirm**. It costs one unlock credit; reading pages and exporting CSVs costs nothing.
4. **Set the date filter.** The dropdown next to "Save Filter" **defaults to Last 90 Days**:
   - Instagram, TikTok, YouTube Shorts: **All Time**.
   - Facebook Reels: **Last 90 Days**. It has no All Time option.

   Open the dropdown by clicking its coordinates, screenshot it, then click "All Time" by coordinates. Clicking the `find` ref for that button can silently miss because the page has two date pickers. **Confirm the filter label now says "All Time"** before reading anything. The post count in the profile header also jumps when the filter applies (e.g. 62 → 161).
5. **Exact views / likes / comments / top video: per-video CSV.** The summary cards are rounded (`39.8M`). Open the second tab (**All content** / **Posts** / **Videos**, depending on platform) with the date filter still set, then capture the **Export videos to CSV** button's output in the page with `javascript_tool`. Don't let it download: Chrome's Save As dialog leaves `.tmp` files in `~/Downloads` and blocks later exports. Hook `URL.createObjectURL` to keep the blob's text in `window.__csv`, make `HTMLAnchorElement.prototype.click` a no-op for `download` links, click `button[aria-label="Export videos to CSV"]`, wait ~3s, then parse the CSV in the page (quoted fields contain newlines) and return the sums of `Views`, `Likes`, `Comments`, the row count, and the top row's `Views` / `Description` / `Create Time`. The hook is lost on navigation, so inject it again on each profile.
   - Instagram and YouTube Shorts per-video values are exact. TikTok rounds each video's views and likes to 3 significant figures above 10K, and Facebook rounds each video's views to the nearest 1K, so mark those cells with `~`.
6. Read the rest of the page with `get_page_text`. Where each metric appears:

   | Table row | Page text |
   | --- | --- |
   | Engagement Rate, Watch Time, Buzz Rank | "More metrics" |
   | Followers | "Follower growth" line (exact, e.g. `31,548 followers`; Facebook comes back rounded, e.g. `16,000`) |
   | Median Views | "Organic engagement" card → `N median views` |
   | Average Views | Not shown any more: CSV views ÷ posts with views (Instagram's Views card says "from 157 of 161 posts") |
   | Est. Sponsored Post Value | "Est. post value" card (round sub-$1K values to whole dollars) |

   Watch Time on Buzzlytics is its own estimate (about 100 seconds per view everywhere), roughly 2.8× too high. **Don't write the raw number.** Multiply each platform's Buzzlytics watch time by its calibration factor and write the result with a `~` prefix: **Instagram × 0.31, TikTok × 0.48, Facebook × 0.33, YouTube Shorts × 0.41**. These factors come from native-dashboard totals pulled on 2026-10-05 (see the Watch Time note in `overall-stats.md`; keep that note). Don't re-scrape the native dashboards for watch time. If the adjusted numbers look off, or the user asks, recalibrate on one platform: YouTube Studio Advanced mode with the Shorts filter (Watch time column, Total row) is the quickest.
7. **YouTube engaged views** aren't on Buzzlytics. Open `https://studio.youtube.com/channel/UCdXorgCT87YlFRN9n8oJ7_A/analytics/tab-content/period-lifetime` (it's already on the ServiceNow Dev Program channel; if not, switch account via the top-right avatar), wait ~20s, check the **Shorts** chip is selected, click **See more**, and zoom on the **Total** row: the exact `Engaged views` (and Studio's `Views`, for the % in the note). It's the only cell in the Engaged Views row; the other platforms and the total stay `—`. Update the date and percentage in the matching note.
8. **LinkedIn** isn't on Buzzlytics. Read the follower count from https://www.linkedin.com/in/earlduque/ (zoom on the `N followers · 500+ connections` line under the headline; `find` can return stale numbers from the previous page). All other LinkedIn cells stay `—`.
9. Close the tab when you're done.

## 2. Update `overall-stats.md`

- Set the caption date to today and keep the filter note.
- Fill the platform cells using the existing formatting: full exact integers from the CSV for views, likes, comments, followers and top video (`39,843,240`, prefixed `~` where the platform rounds); compact form for the rest (`4.9%`, `861.6K hrs`, `44.0K`). Facebook's video count keeps its `*(last 90d)*` suffix.
- **Total / Combined:**
  - Views, comments, videos analyzed, watch time (the factor-adjusted values): sum of the four video platforms.
  - Likes: the same sum. Prefix any total with `~` when one of its inputs carries `~`.
  - **Followers: Instagram + TikTok + Facebook + LinkedIn.** Leave out YouTube Shorts: @servicenowdevprogram is a shared account, so its cell stays `(shared account)`. Sum the exact counts, not the rounded ones.
  - Engagement, median, average, sponsored value, Buzz Rank, top video: `—`.
- Rewrite **Key Takeaways** with the new numbers, keeping the three bullets: Instagram's share of views, TikTok's engagement, and the cross-platform top-video note. Check whether the top video on each platform has changed. Don't leave old numbers in the prose.

## 3. Update the `index.html` banner

Copy from the Total column. Views and likes get one decimal in millions (`62.3M`, `2.9M`); followers round to the nearest thousand (`87K`).

## 4. Verify, commit, push

- Add up each summed row again by hand and check it against the Total column. Check the banner against the Total column.
- Run `git status` / `git diff`. If the branch is behind `origin/main`, `git pull` (fast-forward) first.
- Stage **only** `overall-stats.md` and `index.html`.
- Commit message: `Refresh social stats through YYYY-MM-DD`. In the body, list old → new combined totals (views, likes, followers, watch hours) and name the platform that drove the growth.
- `git push origin main`.

The user set this skill up to run end-to-end, so commit and push without asking again. Stop and ask only if something looks wrong: unrelated pending changes, a merge conflict, a filter that won't switch, or a big unexplained drop in a metric.

If the date-range dropdown shows **All Time** with an "Upgrade" lock (clicking it redirects to `/billing`), the Buzzlytics plan has lapsed. Don't start a trial. Switch to `/manual-refresh-stats`, which reads the same numbers from the platforms' own dashboards.
