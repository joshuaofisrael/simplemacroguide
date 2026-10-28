#!/usr/bin/env python3
"""Simple Macro Guide pre-publish legal hold gate (JI Ventures rule, Joshua 27 Oct 2026; /workspace/content-review/RULE.md).
GitHub Pages serves straight from main, so the real publishing step is `git push`. This gate runs:
  * as the git pre-push hook (scripts/pre-push, installed in .git/hooks/pre-push): checks the exact commit being pushed
    and refuses the push (exit 3) if any page is HOLD_REVIEW;
  * in GitHub Actions on push and pull request (.github/workflows/legal-gate.yml) when that file is present.

Usage:
  legal_gate.py check [--tree DIR] [--no-queue]     every *.html in DIR (default repo root). exit 0 pass, 3 HOLD_REVIEW
  legal_gate.py file PATH [--as REL]                  check one draft page. exit 0 pass, 3 HOLD_REVIEW
  legal_gate.py hold PATH "TITLE" [--test]            save HOLD_REVIEW draft in drafts/simplemacroguide + queue.jsonl line
  legal_gate.py moderate PATH "rule + fix made" ["TITLE"]   independent ChatGPT review, MODERATE tripwires only

SEVERITY (amendment 27 Oct 2026 18:25):
  HIGH = rules 1, 2, 6, 8. HOLD_REVIEW for Joshua only. Passes only with a line in approvals.jsonl
         {"site":"simplemacroguide.com","sha256":<exact file hash>,"approved_by":"Joshua ..."}. Never self cleared.
  MODERATE = rules 3, 4, 5, 7. Objective detectors (3 image without licence record, 4 article without an external
         source link, 7 College Board trademark without non affiliation note) must be fixed so they stop firing.
         Keyword tripwires (5, 7) left after a fix go to chatgpt_review.py; SAFE logs a clearance in
         moderate-clearances.jsonl tied to the sha256. Up to 3 rework rounds, then held for Joshua.
CODE ENFORCED: 1 wrongdoing keyword tripwire; 2 email/phone/street address outside legal pages; 3 remote media and
local images missing from legal/assets.json; 4 article pages need an external source link; 5 personalised advice /
promised returns tripwire; 6 election logistics wording (plain words like election pass); 7 endorsement tripwire and
College Board non affiliation note; 8 legal notice/embargo wording and restrictions list.
JUDGEMENT ONLY: factual accuracy of figures, defamation nuance, whether a headline overstates the evidence.
Normal economics content (Federal Reserve, inflation, BLS, BEA, FRED, ONS, official statistics) passes."""
import sys,os,re,json,hashlib,datetime,glob,subprocess,html as H
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE="simplemacroguide.com"; BOT="Simple Macro Guide SEO bot"
CR=os.environ.get("CONTENT_REVIEW_DIR","/workspace/content-review")
Q=CR+"/queue.jsonl"; MC=CR+"/moderate-clearances.jsonl"; DR=CR+"/drafts/simplemacroguide"; REVIEW=CR+"/bin/chatgpt_review.py"
HIGH={1,2,6,8}; OBJECTIVE_TAGS=("licence record","no external source","non affiliation note")
LEGAL=("privacy/","terms/","disclaimer/","contact/")
EXCLUDE=("tests/","test/","fixtures/",".git/","node_modules/")
EMAIL_OK=("joshuaofisrael@gmail.com",)
NEG=r"\b(not|never|no|nor|isn'?t|aren'?t|without|neither)\b[^.]{0,40}$"
KW={
 1:r"\b(fraud\w*|scam\w*|embezzl\w*|arrested|indicted|charged with|convicted|lawsuits?|sued|suing|misconduct|abus(e|ed|ive) of|dishonest\w*|cover[ -]?up|criminal|brib(e|es|ed|ery)|kickbacks?|ponzi|money laundering|insider trading|cooked the books)\b",
 5:r"\b(guaranteed (returns?|profits?|gains?)|risk free profits?|you should (buy|sell|short|invest in|put your)|buy (this|these) (stock|shares|fund)|we recommend (buying|selling|investing)|tax advice for you|double your money)\b",
 6:r"\b(polling (place|station|location)s?|register to vote|voter registration|registration deadline|vote by mail|mail[ -]in ballots?|absentee ballots?|early voting|election day is|polls (open|close)|certified (results?|winners?)|eligible to vote)\b",
 7:r"\b(endorsed by|official partner|in partnership with|approved by (the )?college board|accredited by|sponsored by|100% (accurate|correct)|guaranteed (score|pass|5)|official (ap|college board) (site|resource|guide))\b",
 8:r"\b(embargo(ed)?|cease and desist|dmca (notice|complaint)|takedown (notice|request)|legal notice|reporting restriction|correction request|copyright complaint)\b",
}
AFFIL=r"not (affiliated|endorsed|sponsored|an official college board)|trademarks? (registered )?(of|by|owned by) (the )?college board|registered trademark"
def sha_bytes(b): return hashlib.sha256(b).hexdigest()
def visible(raw):
    t=re.sub(r"<!--.*?-->"," ",raw,flags=re.S)
    attrs=" ".join(re.findall(r'<(?:title)[^>]*>(.*?)</title>',t,re.S|re.I)+re.findall(r'<meta[^>]+(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"[^>]*content="([^"]*)"',t,re.I)+re.findall(r'\balt="([^"]*)"',t,re.I))
    t=re.sub(r"<(script|style|head)[^>]*>.*?</\1>"," ",t,flags=re.S|re.I)
    return H.unescape(re.sub(r"\s+"," ",attrs+" "+re.sub(r"<[^>]+>"," ",t)))
def lines(name):
    out=[]
    for p in (os.path.join(CR,name),os.path.join(ROOT,"legal",name)):
        if os.path.exists(p):
            for l in open(p):
                try: out.append(json.loads(l))
                except Exception: pass
    return out
def approved(h): return any(j.get("site")==SITE and j.get("sha256")==h and str(j.get("approved_by","")).lower().startswith("joshua") for j in lines("approvals.jsonl"))
def cleared(h): return any(j.get("site")==SITE and j.get("sha256")==h and str(j.get("chatgpt_verdict","")).upper().startswith("SAFE") for j in lines("moderate-clearances.jsonl"))
def restricted():
    r=[]
    for p in (os.path.join(CR,"restrictions-simplemacroguide.txt"),os.path.join(ROOT,"legal","restrictions-simplemacroguide.txt")):
        if os.path.exists(p): r+=[l.strip() for l in open(p) if l.strip() and not l.startswith("#")]
    return r
def assets(tree):
    p=os.path.join(tree,"legal","assets.json")
    if not os.path.exists(p): p=os.path.join(ROOT,"legal","assets.json")
    try: return {a["path"] for a in json.load(open(p)) if a.get("licence")}
    except Exception: return set()
def is_article(rel): return re.match(r"(explainers|topics|countries|data)/",rel) and not rel.endswith("index.html") or rel in ("data/index.html","ap-macroeconomics/index.html")
def scan(raw,rel,tree):
    R=[]; text=visible(raw); legal=rel.startswith(LEGAL)
    if not legal:
        for n,rx in KW.items():
            for m in re.finditer(rx,text,re.I):
                if n in (5,7) and re.search(NEG,text[max(0,m.start()-60):m.start()],re.I): continue
                R.append((n,m.group(0),"keyword tripwire; review")); break
        m=next((m for m in re.finditer(r"[\w.+-]+@[\w-]+\.[a-z][\w.]+",text) if not m.group(0).lower().endswith(EMAIL_OK)),None)
        if m: R.append((2,m.group(0),"email address"))
        m=re.search(r"(?<![\w/.:,-])(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?![\w,.-]?\d)",text)
        if m: R.append((2,m.group(0).strip(),"possible phone number"))
        m=re.search(r"\b\d{1,5}\s+[A-Z][a-z]+(\s[A-Z][a-z]+)*\s(Street|St|Road|Rd|Drive|Dr|Avenue|Ave|Lane|Ln|Court|Ct|Boulevard|Blvd)\b",text)
        if m: R.append((2,m.group(0),"possible street address"))
        if re.search(r"college board|\bAP Macro",text,re.I) and not re.search(AFFIL,text,re.I):
            R.append((7,"College Board / AP mention","College Board trademark used without a non affiliation note"))
    for u in re.findall(r"""(?:src|href|content)=["'](https?://[^"']+\.(?:jpe?g|png|gif|webp|avif|svg|mp4|webm))["']""",raw,re.I):
        if "simplemacroguide.com/" in u: continue
        R.append((3,u,"remote image/video without licence record: self host an owned asset or drop it")); break
    ok=assets(tree)
    for s in re.findall(r"""<img[^>]+src=["']([^"']+)["']|<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']""",raw,re.I):
        s=s[0] or s[1]
        if s.startswith("data:") or (s.startswith("http") and "simplemacroguide.com/" not in s): continue
        p=os.path.normpath(os.path.join(os.path.dirname(rel),s)) if not s.startswith("http") else s.split("simplemacroguide.com/",1)[1]
        if p not in ok: R.append((3,s,"image missing from legal/assets.json licence record")); break
    if is_article(rel):
        ext=[u for u in re.findall(r"""href=["'](https?://[^"']+)["']""",raw) if "simplemacroguide.com" not in u and "googlesyndication" not in u]
        if not ext: R.append((4,"(no external source link)","article page has no external source link: no source actually accessed"))
    for r in restricted():
        if r==rel or r in rel: R.append((8,r,"listed restriction/complaint"))
    return R
def sev(R): return "HIGH" if any(n in HIGH for n,_,_ in R) else ("MODERATE" if R else None)
def objective(R): return any(any(t in s for t in OBJECTIVE_TAGS) or n==3 for n,_,s in R)
def verdict(R,h):
    if not R: return "PASS"
    if approved(h): return "PASS (Joshua approved exact hash)"
    if sev(R)=="MODERATE" and not objective(R) and cleared(h): return "PASS (MODERATE, ChatGPT cleared exact hash)"
    return "HOLD_REVIEW"
def queued(h): return any(j.get("site")==SITE and j.get("sha256")==h and j.get("status")=="HOLD_REVIEW" for j in lines("queue.jsonl"))
def title_of(raw,rel):
    m=re.search(r"<title[^>]*>(.*?)</title>",raw,re.S|re.I); return H.unescape(m.group(1).strip()) if m else rel
def queue(title,R,draft,h,raw,test=False):
    os.makedirs(CR,exist_ok=True)
    src=[u for u in re.findall(r"""href=["'](https?://[^"']+)["']""",raw) if "simplemacroguide.com" not in u][:20]
    j={"ts":datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),"site":SITE,"bot":BOT,"title":("TEST ONLY: " if test and not title.startswith("TEST ONLY") else "")+title,
       "flagged":"; ".join(f"[{n}] {f}" for n,f,_ in R),"rule":sorted(set(n for n,_,_ in R)),"sources":src,
       "suggestion":"; ".join(sorted(set(s for _,_,s in R)))+("; HIGH: Joshua to approve this exact version or tell the bot to drop it (do not soften to bypass review)" if sev(R)=="HIGH" else ""),
       "severity":sev(R),"draft_path":draft,"sha256":h,"status":"HOLD_REVIEW"}
    if test: j["test_only"]=True; j["note"]="TEST ONLY gate test item, never published, no action needed"
    open(Q,"a").write(json.dumps(j,ensure_ascii=False)+"\n")
def save_draft(raw,name):
    os.makedirs(DR,exist_ok=True); dp=os.path.join(DR,name.replace("/","__").replace(".html","")+".HOLD_REVIEW.html")
    open(dp,"w",encoding="utf-8").write(raw); return dp
def report(v,R,rel,h):
    print(v,sev(R) or "",rel,"sha256",h[:12])
    for r,f,s in R: print(f"  rule {r} [{'HIGH' if r in HIGH else 'MODERATE'}]: {f!r} {s}")
def files(tree):
    for p in sorted(glob.glob(os.path.join(tree,"**/*.html"),recursive=True)):
        rel=os.path.relpath(p,tree).replace(os.sep,"/")
        if any(rel.startswith(x) or "/"+x in rel for x in EXCLUDE): continue
        yield p,rel
def main(a):
    if a and a[0]=="check":
        tree=os.path.abspath(a[a.index("--tree")+1]) if "--tree" in a else ROOT; noq="--no-queue" in a or not os.path.isdir(CR)
        bad=n=0
        for p,rel in files(tree):
            b=open(p,"rb").read(); raw=b.decode("utf-8","ignore"); h=sha_bytes(b); R=scan(raw,rel,tree); v=verdict(R,h); n+=1
            if v=="HOLD_REVIEW":
                bad+=1; report(v,R,rel,h)
                if not noq and not queued(h): queue(title_of(raw,rel),R,save_draft(raw,rel),h,raw)
            elif R: print(v,rel)
        print(f"legal gate: {n} pages checked, {bad} HOLD_REVIEW"); return 3 if bad else 0
    if a and a[0] in ("file","hold","moderate") and len(a)>=2:
        b=open(a[1],"rb").read(); raw=b.decode("utf-8","ignore"); h=sha_bytes(b)
        rel=a[a.index("--as")+1] if "--as" in a else "explainers/"+os.path.basename(a[1]); R=scan(raw,rel,ROOT); title=title_of(raw,rel)
        if a[0]=="file": v=verdict(R,h); report(v,R,rel,h); return 0 if v.startswith("PASS") else 3
        if a[0]=="hold":
            test="--test" in a; t=a[2] if len(a)>2 and not a[2].startswith("--") else title
            dp=save_draft(raw,("TEST-" if test else "")+os.path.basename(a[1]))
            queue(t,R or [(0,"manual","held by bot judgement")],dp,h,raw,test=test); print("HOLD_REVIEW: NOT published. Draft:",dp); return 3
        if a[0]=="moderate":
            fix=a[2] if len(a)>2 else ""
            if not R: print(json.dumps({"cleared":True,"verdict":"NO_FINDINGS"})); return 0
            if sev(R)!="MODERATE": print(json.dumps({"cleared":False,"verdict":"HIGH","reasons":["HIGH severity: Joshua only"]})); return 3
            if objective(R): print(json.dumps({"cleared":False,"verdict":"NOT_FIXED","reasons":["licence/source/affiliation detector still fires: fix it"]})); return 3
            ctx="; ".join(f"rule {n} flag {f!r}" for n,f,_ in R)+" | fix made: "+fix
            r=subprocess.run([sys.executable,REVIEW,a[1],ctx],capture_output=True,text=True,timeout=300)
            try: v=json.loads(r.stdout.strip().splitlines()[-1])
            except Exception: v={"verdict":"UNSURE","reasons":["unparseable reviewer output"]}
            ok=r.returncode==0 and v.get("verdict")=="SAFE"
            if ok: open(MC,"a").write(json.dumps({"ts":datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),"site":SITE,"bot":BOT,"title":a[3] if len(a)>3 else title,
                "rule":sorted(set(n for n,_,_ in R)),"fix":fix,"chatgpt_verdict":"SAFE: "+"; ".join(map(str,v.get("reasons",[])))[:500],"sha256":h},ensure_ascii=False)+"\n")
            print(json.dumps({"cleared":ok,**v})); return 0 if ok else 3
    print(__doc__); return 2
if __name__=="__main__": sys.exit(main(sys.argv[1:]))
