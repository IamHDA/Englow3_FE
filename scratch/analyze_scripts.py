import re
import json

def analyze_script(path, label):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        code = f.read()
    print(f"=== ANALYZING {label} ({len(code)} chars) ===")

    # Search for string literals or component names or screens
    # In bundled page, there might be base64 or escaped HTML or JSON
    matches_const = re.findall(r'const\s+([A-Z0-9_]+)\s*=', code)
    print("Constants:", matches_const[:30])

    # Search for screens or views
    screens = re.findall(r'[A-Za-z0-9_-]+(?:Screen|Page|View|Modal|Deck|Card|Quiz|Question|Session|Summary)', code)
    print("Screen-like words (sample):", list(set(screens))[:30])

    # Look for decoded template strings or HTML tags
    html_snippets = re.findall(r'<[a-z1-6]+[^>]*>.*?</[a-z1-6]+>', code, re.IGNORECASE)
    print(f"HTML snippets found: {len(html_snippets)}")

    # Extract all Vietnamese / English readable sentences
    phrases = re.findall(r'"([^"\\]{10,80})"', code)
    readable = [p for p in phrases if any(c.isalpha() for c in p) and not p.startswith("data:") and not p.startswith("http")]
    print("Sample readable phrases:")
    for p in readable[:25]:
        print("  *", p)

    # Save readable phrases to file for deeper look
    with open(f"scratch/{label.lower()}_readable.txt", "w", encoding="utf-8") as rf:
        for p in readable:
            rf.write(p + "\n")

analyze_script("scratch/flashcard_script_4.js", "FLASHCARD")
analyze_script("scratch/quiz_script_4.js", "QUIZ")
