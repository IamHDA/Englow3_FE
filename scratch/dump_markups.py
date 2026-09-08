with open("scratch/flashcard_script_4.js", "r", encoding="utf-8", errors="ignore") as f:
    fc = f.read()

idx = fc.find("class Component")
print("Flashcard code before class Component:", len(fc[:idx]))
with open("scratch/flashcard_before_component.txt", "w", encoding="utf-8") as f:
    f.write(fc[:idx])

with open("scratch/quiz_script_4.js", "r", encoding="utf-8", errors="ignore") as f:
    qc = f.read()

qidx = qc.find("class Component")
print("Quiz code before class Component:", len(qc[:qidx]))
with open("scratch/quiz_before_component.txt", "w", encoding="utf-8") as f:
    f.write(qc[:qidx])

# Also let's inspect the entire HTML file (not just script 4) to find the HTML markup
from bs4 import BeautifulSoup
def dump_html_structure(path, out_path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    soup = BeautifulSoup(html, "html.parser")
    # remove all script and style
    for s in soup(["script", "style"]):
        s.decompose()
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(soup.prettify())

dump_html_structure(r"C:\Users\GIGABYTE\Downloads\Englow3 Flashcard App.html", "scratch/flashcard_markup.html")
dump_html_structure(r"C:\Users\GIGABYTE\Downloads\Englow3 Quiz.html", "scratch/quiz_markup.html")
print("Dumped markup files.")
