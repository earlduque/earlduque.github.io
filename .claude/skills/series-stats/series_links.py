"""Print the Accidental IT Guy episode links from Fairbairn's upload-log.md as JSON.

Usage: python series_links.py [path/to/upload-log.md]

Output: {"episodes": [{"ep": "01", "caption": ..., "posted": ..., "tiktok": id, "instagram": id,
          "facebook": id, "youtube": id}, ...],
         "ids": {"tiktok": {"01": id, ...}, "instagram": {...}, "facebook": {...}, "youtube": {...}}}
A missing platform is null in "episodes" and absent from "ids". The Lore Dump has ep "lore".
"""
import json
import re
import sys

LOG = sys.argv[1] if len(sys.argv) > 1 else r"C:\Storage\GitHub\Fairbairn\upload-log.md"
SERIES_DIR = "idea-scripts/series/accidental-it-guy/"
ID_PATTERNS = {
    "tiktok": r"tiktok\.com/@[^/]+/video/(\d+)",
    "instagram": r"instagram\.com/reels?/([A-Za-z0-9_-]+)",
    "facebook": r"facebook\.com/reel/(\d+)",
    "youtube": r"youtube\.com/shorts/([A-Za-z0-9_-]+)",
}
COLUMNS = ["tiktok", "instagram", "facebook", "youtube"]  # cells 4-7 of each table row

episodes = []
with open(LOG, encoding="utf-8") as f:
    for line in f:
        if not line.startswith("| 20"):
            continue
        cells = [c.strip() for c in line.split("|")]
        posted, caption, script = cells[1], cells[2], cells[3]
        m = re.search(r"accidental-it-(\d+)-", script) if SERIES_DIR in script else None
        if m:
            ep = m.group(1)
        elif "accidental it guy lore" in caption.lower():
            ep = "lore"
        else:
            continue
        row = {"ep": ep, "caption": re.sub(r"\s*\(\d\d:\d\d\)$", "", caption), "posted": posted}
        for col, cell in zip(COLUMNS, cells[4:8]):
            hit = re.search(ID_PATTERNS[col], cell)
            row[col] = hit.group(1) if hit else None
        episodes.append(row)

episodes.sort(key=lambda r: (r["ep"] == "lore", r["ep"]))
ids = {col: {r["ep"]: r[col] for r in episodes if r[col]} for col in COLUMNS}
print(json.dumps({"episodes": episodes, "ids": ids}, ensure_ascii=False, indent=1))
