import sys
import re
from bs4 import BeautifulSoup
sys.stdout.reconfigure(encoding='utf-8')

def dump_all_info(path, label, out_txt):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    ids = [el.get("id") for el in soup.find_all(id=True)]
    screen_ids = [i for i in ids if re.match(r"^[0-9]+[a-z]?$", i)]

    with open(out_txt, "w", encoding="utf-8") as out:
        out.write(f"============================== {label} ==============================\n")
        out.write(f"Screen IDs: {screen_ids}\n\n")

        for sid in screen_ids:
            el = soup.find(id=sid)
            if el:
                out.write(f"------------------- SCREEN {sid} -------------------\n")
                out.write(el.get_text(separator="\n", strip=True))
                out.write("\n\n")

    print(f"[{label}] Wrote screen dump to {out_txt} with screens: {screen_ids}")

dump_all_info("scratch/flashcard_template.html", "FLASHCARD", "scratch/flashcard_screens_dump.txt")
dump_all_info("scratch/quiz_template.html", "QUIZ", "scratch/quiz_screens_dump.txt")
