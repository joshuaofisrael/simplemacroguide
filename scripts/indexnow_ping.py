#!/usr/bin/env python3
"""IndexNow ping for Simple Macro Guide.

GitHub Pages serves this site straight from main, so `git push` to main is the
publish step; the matching CI step is .github/workflows/indexnow.yml, which
runs this script on push to main and diffs github.event.before..github.sha.

It finds the IndexNow key file at the repo root (a bare 32 character hex
`<key>.txt` file, served at the site root per the IndexNow protocol), maps the
HTML files that changed between two commits to their canonical sitemap URLs,
and POSTs them (plus the sitemap URL) to https://api.indexnow.org/indexnow so
Bing, Yandex, Seznam.cz, Naver, and IndexNow-reading search engines pick up
the change without waiting for a crawl.

Usage:
  indexnow_ping.py [--before SHA] [--after SHA] [--full] [--dry-run]

  --before/--after   commit range to diff (default: HEAD^..HEAD)
  --full             submit every URL in sitemap.xml instead of a diff
  --dry-run          print the request body instead of sending it

Exit 0 on success or when there is nothing to submit. Exit 1 on error so a CI
step that calls this script fails loudly instead of silently skipping a ping.
"""
import sys, os, re, json, glob, subprocess, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENDPOINT = "https://api.indexnow.org/indexnow"


def site_host():
    p = os.path.join(ROOT, "CNAME")
    if os.path.exists(p):
        return open(p).read().strip()
    raise SystemExit("indexnow_ping: no CNAME file found to determine the host")


def key_and_location(host):
    for p in sorted(glob.glob(os.path.join(ROOT, "*.txt"))):
        name = os.path.basename(p)
        key = name[:-4]
        if re.fullmatch(r"[0-9a-fA-F]{8,128}", key):
            return key, f"https://{host}/{name}"
    raise SystemExit("indexnow_ping: no IndexNow key file (<32-hex-char>.txt) found at repo root")


def sitemap_urls():
    raw = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
    return re.findall(r"<loc>([^<]+)</loc>", raw)


def rel_to_url(rel, host, url_by_path):
    if rel == "sitemap.xml":
        return f"https://{host}/sitemap.xml"
    if not rel.endswith(".html"):
        return None
    if rel in url_by_path:
        return url_by_path[rel]
    # Fallback for a path not yet listed in sitemap.xml (e.g. a brand new page).
    if rel == "index.html":
        return f"https://{host}/"
    if rel.endswith("/index.html"):
        return f"https://{host}/{rel[:-len('index.html')]}"
    return f"https://{host}/{rel}"


def changed_files(before, after):
    out = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACMR", f"{before}..{after}"],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    return [l.strip() for l in out.splitlines() if l.strip()]


def build_url_list(before, after, full):
    host = site_host()
    urls = sitemap_urls()
    url_by_path = {u.split(host + "/", 1)[1]: u for u in urls if host + "/" in u}
    # The homepage's sitemap loc has no trailing index.html; map it explicitly too.
    url_by_path.setdefault("index.html", f"https://{host}/")

    if full:
        return sorted(set(urls) | {f"https://{host}/sitemap.xml"})

    changed_page_urls = set()
    for rel in changed_files(before, after):
        u = rel_to_url(rel, host, url_by_path)
        if u:
            changed_page_urls.add(u)
    if not changed_page_urls:
        return []
    changed_page_urls.add(f"https://{host}/sitemap.xml")
    return sorted(changed_page_urls)


def ping(host, key, key_location, url_list, dry_run):
    body = {"host": host, "key": key, "keyLocation": key_location, "urlList": url_list}
    data = json.dumps(body).encode("utf-8")
    if dry_run:
        print(json.dumps(body, indent=2))
        return 0
    req = urllib.request.Request(
        ENDPOINT, data=data, method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            status = resp.status
            text = resp.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        status = e.code
        text = e.read().decode("utf-8", "ignore")
    print(f"indexnow_ping: POST {ENDPOINT} -> {status} {text}".rstrip())
    # IndexNow returns 200 (OK) or 202 (Accepted, key not yet verified by all engines).
    return 0 if status in (200, 202) else 1


def main(argv):
    before, after, full, dry_run = "HEAD^", "HEAD", False, False
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--before":
            i += 1; before = argv[i]
        elif a == "--after":
            i += 1; after = argv[i]
        elif a == "--full":
            full = True
        elif a == "--dry-run":
            dry_run = True
        else:
            print(__doc__); return 2
        i += 1

    host = site_host()
    key, key_location = key_and_location(host)
    url_list = build_url_list(before, after, full)
    if not url_list:
        print("indexnow_ping: no article/sitemap changes in range; nothing to submit")
        return 0
    print(f"indexnow_ping: submitting {len(url_list)} URL(s): {', '.join(url_list)}")
    return ping(host, key, key_location, url_list, dry_run)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
