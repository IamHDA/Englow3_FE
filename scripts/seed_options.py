import psycopg2
from psycopg2.extras import execute_values
import uuid

conn = psycopg2.connect(
    'postgresql://postgres.jwqiedfdcjqbyyyemicb:X2F5C4aAgpfyMYT7@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require'
)
conn.autocommit = True
cur = conn.cursor()

# Find questions that don't have options
cur.execute("""
    SELECT q.id, q.order_no, q.skill_type
    FROM englow3.questions q
    LEFT JOIN englow3.question_options qo ON qo.question_id = q.id
    WHERE qo.id IS NULL
""")
questions = cur.fetchall()
print(f"Found {len(questions)} questions without options.")

if questions:
    options_rows = []
    for q_id, q_order, skill in questions:
        # Standard realistic 4 options
        opts = [
            (str(uuid.uuid4()), q_id, "Phương án A - Lựa chọn khả thi thứ nhất", 1, "Giải thích ngữ pháp và từ vựng cho đáp án A.", True),
            (str(uuid.uuid4()), q_id, "Phương án B - Bẫy từ vựng thường gặp", 2, "Phương án gây nhiễu, sai thì của động từ.", False),
            (str(uuid.uuid4()), q_id, "Phương án C - Không phù hợp ngữ cảnh", 3, "Phương án không phù hợp với chủ ngữ số nhiều.", False),
            (str(uuid.uuid4()), q_id, "Phương án D - Sai liên từ nối", 4, "Cấu trúc đảo ngữ không được áp dụng tại vị trí này.", False),
        ]
        options_rows.extend(opts)

    print(f"Inserting {len(options_rows)} options...")
    execute_values(
        cur,
        """
        INSERT INTO englow3.question_options (
            id, question_id, content, order_no, explanation, is_correct
        ) VALUES %s
        """,
        options_rows,
        page_size=1000
    )
    print("Options inserted successfully!")

conn.close()
