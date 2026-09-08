import os
import re
from bs4 import BeautifulSoup

def inspect_file(path, label):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    print(f"=== {label} ({len(content)} chars) ===")
    soup = BeautifulSoup(content, "html.parser")
    
    title = soup.title.string if soup.title else "No title"
    print("Title:", title)
    
    headings = [h.get_text().strip() for h in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"])]
    print("Headings (first 20):", headings[:20])
    
    # Check script tags
    scripts = soup.find_all("script")
    print(f"Found {len(scripts)} scripts.")
    for i, s in enumerate(scripts):
        src = s.get("src", "inline")
        text = s.string or ""
        print(f"  Script {i}: src={src}, len={len(text)}")
        if len(text) > 200:
            # write out script for analysis
            out_name = f"scratch/{label.lower()}_script_{i}.js"
            with open(out_name, "w", encoding="utf-8") as sf:
                sf.write(text)
            print(f"    Wrote {out_name}")

    # Check IDs of main containers
    ids = [el.get("id") for el in soup.find_all(id=True)]
    print("IDs:", ids[:30])

inspect_file(r"C:\Users\GIGABYTE\Downloads\Englow3 Flashcard App.html", "FLASHCARD")
inspect_file(r"C:\Users\GIGABYTE\Downloads\Englow3 Quiz.html", "QUIZ")
