import json
from bs4 import BeautifulSoup

def dump_template(html_path, prefix):
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    manifest_el = soup.find("script", type="__bundler/manifest")
    template_el = soup.find("script", type="__bundler/template")

    if manifest_el:
        manifest = json.loads(manifest_el.string)
        with open(f"scratch/{prefix}_manifest.json", "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
        print(f"[{prefix}] Manifest type: {type(manifest)}, len: {len(manifest)}")

    if template_el:
        template = json.loads(template_el.string)
        with open(f"scratch/{prefix}_template.html", "w", encoding="utf-8") as f:
            f.write(template)
        print(f"[{prefix}] Wrote template ({len(template)} chars)")

dump_template(r"C:\Users\GIGABYTE\Downloads\Englow3 Flashcard App.html", "flashcard")
dump_template(r"C:\Users\GIGABYTE\Downloads\Englow3 Quiz.html", "quiz")
