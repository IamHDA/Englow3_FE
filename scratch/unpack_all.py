import os
import re
import json
import base64

def unpack(html_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    with open(html_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    print(f"Unpacking {html_path} ({len(content)} chars) into {out_dir}...")

    # Manifest
    manifest_match = re.search(r'data-manifest=([\'"])(.*?)\1', content)
    if manifest_match:
        try:
            m_raw = manifest_match.group(2).replace("&quot;", '"')
            manifest = json.loads(m_raw)
            print(f"  Found manifest with {len(manifest)} items.")
            with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2)
        except Exception as e:
            print("  Manifest error:", e)

    # Template
    templates = re.findall(r'<template[^>]*>([\s\S]*?)</template>', content, re.IGNORECASE)
    print(f"  Found {len(templates)} templates.")
    for i, t in enumerate(templates):
        with open(os.path.join(out_dir, f"template_{i}.html"), "w", encoding="utf-8") as f:
            f.write(t)

    # Asset scripts
    assets = re.findall(r'<script[^>]*data-asset-id=[\'"]([^\'"]+)[\'"][^>]*>([\s\S]*?)</script>', content, re.IGNORECASE)
    print(f"  Found {len(assets)} script assets.")
    for a_id, a_data in assets:
        with open(os.path.join(out_dir, f"asset_{a_id}.txt"), "w", encoding="utf-8") as f:
            f.write(a_data)

unpack(r"C:\Users\GIGABYTE\Downloads\Englow3 Flashcard App.html", r"C:\Users\GIGABYTE\.gemini\antigravity-ide\brain\50fee016-bdf0-4d0f-a558-ded74a35c31e\scratch\flashcard")
unpack(r"C:\Users\GIGABYTE\Downloads\Englow3 Quiz.html", r"C:\Users\GIGABYTE\.gemini\antigravity-ide\brain\50fee016-bdf0-4d0f-a558-ded74a35c31e\scratch\quiz")
print("Done unpacking.")
