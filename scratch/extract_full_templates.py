import re

def extract_content(path, label):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        code = f.read()

    # Find the HTML template or DCLogic component
    # Often in these prototypes, there's a template HTML string or a class Component extends DCLogic
    print(f"=== {label} ===")
    component_match = re.search(r'class\s+Component\s+extends\s+DCLogic[\s\S]*', code)
    if component_match:
        print("Found DCLogic Component!")
        with open(f"scratch/{label.lower()}_component.js", "w", encoding="utf-8") as f_out:
            f_out.write(component_match.group(0))

    # Also look for template HTML string or markup
    # e.g., template: "..." or `...`
    templates = re.findall(r'`([\s\S]{500,})`', code)
    print(f"Found {len(templates)} template backtick strings.")
    for i, t in enumerate(templates):
        with open(f"scratch/{label.lower()}_template_{i}.html", "w", encoding="utf-8") as f_out:
            f_out.write(t)

    # Let's also extract all const declarations
    const_blocks = re.findall(r'(const\s+[A-Z0-9_]+\s*=\s*[\s\S]*?;)', code)
    print(f"Found {len(const_blocks)} const blocks.")
    with open(f"scratch/{label.lower()}_constants.js", "w", encoding="utf-8") as f_out:
        for cb in const_blocks:
            f_out.write(cb[:2000] + "\n\n")

extract_content("scratch/flashcard_script_4.js", "FLASHCARD")
extract_content("scratch/quiz_script_4.js", "QUIZ")
