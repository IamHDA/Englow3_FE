import re
from bs4 import BeautifulSoup

def analyze_template_html(path, label):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    print(f"==================== {label} ({len(html)} chars) ====================")
    soup = BeautifulSoup(html, "html.parser")

    # Find titles/headings
    headings = [h.get_text().strip() for h in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])]
    print("Headings:")
    for h in headings[:25]:
        if h: print("  -", h)

    # Find screen IDs or main views (e.g. 1a, 1b, 2a, etc.)
    ids = [el.get("id") for el in soup.find_all(id=True)]
    print("\nNotable IDs:")
    screen_ids = [i for i in ids if re.match(r"^[0-9]+[a-z]?$|^screen|^view|^tab", i, re.IGNORECASE)]
    print("  Screens:", screen_ids)

    # Dump readable text summary per screen
    print("\nScreen Sections Dump:")
    for sid in screen_ids:
        el = soup.find(id=sid)
        if el:
            txt = el.get_text(separator=" | ", strip=True)
            print(f"  [Screen {sid}]: {txt[:180]}...")

    # Look for scripts and component logic
    scripts = soup.find_all("script")
    print(f"\nScripts in template: {len(scripts)}")
    for i, s in enumerate(scripts):
        txt = s.string or ""
        if len(txt) > 200:
            print(f"  Script {i} (len {len(txt)})")
            with open(f"scratch/{label.lower()}_inner_script_{i}.js", "w", encoding="utf-8") as sf:
                sf.write(txt)

analyze_template_html("scratch/flashcard_template.html", "FLASHCARD")
analyze_template_html("scratch/quiz_template.html", "QUIZ")
