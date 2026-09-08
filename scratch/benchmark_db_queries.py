import time
import psycopg2

conn = psycopg2.connect(
    host='aws-0-ap-northeast-1.pooler.supabase.com',
    port=5432,
    dbname='postgres',
    user='postgres.jwqiedfdcjqbyyyemicb',
    password='X2F5C4aAgpfyMYT7',
    sslmode='require'
)
cur = conn.cursor()

# 1. Search catalogue query
t0 = time.time()
cur.execute("""
    SELECT id, title, exam_type, status, created_at
    FROM englow3.exams
    WHERE status = 'PUBLISHED' AND exam_type = 'MOCK'
    ORDER BY created_at DESC
    LIMIT 8;
""")
exams = cur.fetchall()
dt_search = (time.time() - t0) * 1000
print(f"Catalogue query returned {len(exams)} exams in {dt_search:.1f}ms")

# 2. Sequential countQuestions (what Spring Boot currently does)
t0 = time.time()
counts = []
for e in exams:
    e_id = e[0]
    cur.execute("""
        SELECT count(q.id)
        FROM englow3.questions q
        JOIN englow3.question_sets qs ON q.question_set_id = qs.id
        JOIN englow3.section_parts sp ON qs.section_part_id = sp.id
        JOIN englow3.exam_sections s ON sp.exam_section_id = s.id
        WHERE s.exam_id = %s;
    """, (e_id,))
    counts.append(cur.fetchone()[0])
dt_n_plus_1 = (time.time() - t0) * 1000
print(f"Sequential N+1 queries ({len(exams)} times) took {dt_n_plus_1:.1f}ms: {counts}")

# 3. Batched single query (the proposed optimization)
t0 = time.time()
exam_ids = [e[0] for e in exams]
cur.execute("""
    SELECT s.exam_id, count(q.id)
    FROM englow3.questions q
    JOIN englow3.question_sets qs ON q.question_set_id = qs.id
    JOIN englow3.section_parts sp ON qs.section_part_id = sp.id
    JOIN englow3.exam_sections s ON sp.exam_section_id = s.id
    WHERE s.exam_id = ANY(%s::uuid[])
    GROUP BY s.exam_id;
""", (exam_ids,))
batch_counts = dict(cur.fetchall())
dt_batch = (time.time() - t0) * 1000
print(f"Batched 1-query took {dt_batch:.1f}ms: {batch_counts}")

conn.close()
