import json
from bs4 import BeautifulSoup

def unpack_bundler(html_path, prefix):
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()

    soup = BeautifulSoup(html, "html.parser")
    manifest_el = soup.find("script", type="__bundler/manifest")
    template_el = soup.find("script", type="__bundler/template")

    if manifest_el and template_el:
        manifest = json.loads(manifest_el.string)
        template = json.loads(template_el.string)

        print(f"[{prefix}] Manifest items: {len(manifest)}, Template length: {len(template)}")

        # Collect text assets
        asset_scripts = soup.find_all("script", attrs={"data-asset-id": True})
        print(f"[{prefix}] Found {len(asset_scripts)} asset scripts")
        asset_map = {}
        for s in asset_scripts:
            aid = s["data-asset-id"]
            asset_map[aid] = s.string

        # Substitute assets into template if needed
        unpacked_html = template
        for item in manifest:
            uuid = item.get("uuid")
            aid = item.get("assetId")
            mime = item.get("mime", "")
            if aid and aid in asset_map and "text" in mime or "html" in mime or "javascript" in mime or "css" in mime:
                unpacked_html = unpacked_html.replace(uuid, asset_map[aid])

        with open(f"scratch/{prefix}_unpacked.html", "w", encoding="utf-8") as out:
            out.write(unpacked_html)
        print(f"[{prefix}] Wrote scratch/{prefix}_unpacked.html ({len(unpacked_html)} chars)")
    else:
        print(f"[{prefix}] Not found bundler tags!")

unpack_bundler(r"C:\Users\GIGABYTE\Downloads\Englow3 Flashcard App.html", "flashcard")
unpack_bundler(r"C:\Users\GIGABYTE\Downloads\Englow3 Quiz.html", "quiz")
