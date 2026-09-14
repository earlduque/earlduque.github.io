---
name: refresh-stats
description: Refresh earlduque.com's social stats end-to-end — pulls fresh numbers from Buzzlytics (tiktokviewcount.com) in Chrome, rewrites the table and takeaways in overall-stats.md, updates the combined stats banner in index.html, commits, and pushes. Use whenever the user wants to update/refresh stats, follower counts, views, or the stats banner.
---

# Refreshing social stats

`overall-stats.md` holds one column per platform plus a **Total / Combined** column. The stats banner in `index.html` (the `stats-banner` section, marked `Source numbers: overall-stats.md`) shows three of those totals. Both files change together.

## 1. Collect the numbers (Claude in Chrome)

Don't count on the user's already-open tabs. The tools only see tabs inside Claude's tab group, and that group disappears if its last tab closes while the user is dragging tabs in. Open the pages yourself:

1. Call `tabs_context_mcp` with `createIfEmpty: true` and use that tab.
2. Visit each profile URL linked in the table header of `overall-stats.md`: Instagram Reels, TikTok, Facebook Reels, YouTube Shorts. Pages take ~10s to load; the first screenshot is often blank.
3. **Set the date filter.** The dropdown next to "Save Filter" **defaults to Last 90 Days**:
   - Instagram, TikTok, YouTube Shorts: **All Time**.
   - Facebook Reels: **Last 90 Days**. It has no All Time option.

   Open the dropdown by clicking its coordinates, screenshot it, then click "All Time" by coordinates. Clicking the `find` ref for that button can silently miss because the page has two date pickers. **Confirm the filter label now says "All Time"** before reading anything. The video count in the profile header also jumps when the filter applies (e.g. 48 → 203).
4. Read the page with `get_page_text`. Where each metric appears:

   | Table row | Page text |
   | --- | --- |
   | Total Views / Likes / Comments / Videos | "Account Stats" block |
   | Engagement Rate, Watch Time, Buzz Rank | "MORE METRICS" |
   | Followers | "Follower growth" line (exact, e.g. `31,548 followers`) |
   | Median / Average Views | "Agency Insights" → MEDIAN VIEWS / AVG VIEWS |
   | Est. Sponsored Post Value | "EST. SPONSORED POST" card (round sub-$1K values to whole dollars) |
   | Top Performing Video | "TOP VIDEO" card; titles come from "Viral Videos" / "Views Velocity" |

5. **LinkedIn** isn't on Buzzlytics. Use the follower count the user gives you. If they didn't give one, ask. All other LinkedIn cells stay `—`.
6. Close the tab when you're done.

## 2. Update `overall-stats.md`

- Set the caption date to today and keep the filter note.
- Fill the platform cells using the existing formatting: `33.1M`, `169.1K`, `4.9%`, `861.6K hrs`, `44.0K`. Facebook's video count keeps its `*(last 90d)*` suffix.
- **Total / Combined:**
  - Views, comments, videos analyzed, watch time: sum of the four video platforms.
  - Likes: the same sum, written with a `~` prefix (e.g. `~2.87M`).
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
