import psycopg2
from psycopg2.extras import execute_values
import uuid
import sys
from datetime import datetime, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


conn = psycopg2.connect(
    'postgresql://postgres.jwqiedfdcjqbyyyemicb:X2F5C4aAgpfyMYT7@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require'
)
conn.autocommit = True
cur = conn.cursor()

admin_id = 'fd4bc1bd-13ed-4b17-a391-4231cf61a451'
now = datetime.now(timezone.utc)

exams = [
    {
        'title': 'ETS TOEIC 2024 - Test 01',
        'description': 'Đề thi thử TOEIC L&R chuẩn format ETS 2024 gồm 100 câu Listening và 100 câu Reading với audio giọng đọc chuẩn quốc tế.',
        'exam_type': 'MOCK',
        'certificate_type': 'TOEIC',
        'certificate_variant': 'LR',
        'target_level': 'B2',
        'duration_seconds': 7200,
        'max_raw_score': 990.0,
        'pass_score': 450.0,
        'sections': [('LISTENING', 100, 495.0), ('READING', 100, 495.0)]
    },
    {
        'title': 'ETS TOEIC 2024 - Test 02',
        'description': 'Bộ đề mô phỏng sát xu hướng ra đề năm 2024, bẫy từ vựng Part 5 và đoạn hội thoại nhanh Part 3-4.',
        'exam_type': 'MOCK',
        'certificate_type': 'TOEIC',
        'certificate_variant': 'LR',
        'target_level': 'B2',
        'duration_seconds': 7200,
        'max_raw_score': 990.0,
        'pass_score': 500.0,
        'sections': [('LISTENING', 100, 495.0), ('READING', 100, 495.0)]
    },
    {
        'title': 'IELTS Academic Practice Test 04',
        'description': 'Đề luyện thi IELTS Học thuật bao gồm 4 kỹ năng: Nghe, Đọc học thuật chuyên sâu và Viết luận học thuật Task 1-2.',
        'exam_type': 'MOCK',
        'certificate_type': 'IELTS',
        'certificate_variant': 'ACADEMIC',
        'target_level': 'C1',
        'duration_seconds': 9600,
        'max_raw_score': 9.0,
        'pass_score': 6.0,
        'sections': [('LISTENING', 40, 4.5), ('READING', 40, 4.5)]
    },
    {
        'title': 'TOEIC Speaking & Writing Practice 01',
        'description': 'Đề luyện kỹ năng Nói & Viết TOEIC với bài đọc to, miêu tả tranh, trả lời câu hỏi và viết luận thể hiện quan điểm.',
        'exam_type': 'MOCK',
        'certificate_type': 'TOEIC',
        'certificate_variant': 'SW',
        'target_level': 'B1',
        'duration_seconds': 4800,
        'max_raw_score': 400.0,
        'pass_score': 200.0,
        'sections': [('SPEAKING', 11, 200.0), ('WRITING', 8, 200.0)]
    },
    {
        'title': 'IELTS General Training Test 02',
        'description': 'Đề thi IELTS Tổng quát phù hợp cho mục đích định cư và làm việc quốc tế, tập trung tình huống giao tiếp đời sống.',
        'exam_type': 'MOCK',
        'certificate_type': 'IELTS',
        'certificate_variant': 'GENERAL',
        'target_level': 'B2',
        'duration_seconds': 9600,
        'max_raw_score': 9.0,
        'pass_score': 6.0,
        'sections': [('LISTENING', 40, 4.5), ('READING', 40, 4.5)]
    },
    {
        'title': 'TOEIC L&R Sơ cấp - Foundation Test',
        'description': 'Đề thi thử rút gọn dành cho người mới bắt đầu hoặc củng cố kiến thức căn bản, ngữ tốc đàm thoại vừa phải.',
        'exam_type': 'MOCK',
        'certificate_type': 'TOEIC',
        'certificate_variant': 'LR',
        'target_level': 'A2',
        'duration_seconds': 3600,
        'max_raw_score': 450.0,
        'pass_score': 250.0,
        'sections': [('LISTENING', 50, 225.0), ('READING', 50, 225.0)]
    },
    {
        'title': 'ETS TOEIC 2024 - Master Test 03',
        'description': 'Đề thi thử phân loại cao cấp hướng tới mục tiêu 850-990 điểm, tăng cường đoạn văn kép Part 7 và từ vựng chuyên ngành.',
        'exam_type': 'MOCK',
        'certificate_type': 'TOEIC',
        'certificate_variant': 'LR',
        'target_level': 'C1',
        'duration_seconds': 7200,
        'max_raw_score': 990.0,
        'pass_score': 750.0,
        'sections': [('LISTENING', 100, 495.0), ('READING', 100, 495.0)]
    },
    {
        'title': 'IELTS Academic Advanced Test 05',
        'description': 'Bài thi học thuật độ khó cao với chủ đề khoa học, xã hội học và nghệ thuật đương đại, kèm thang điểm đối chiếu chuẩn Cam.',
        'exam_type': 'MOCK',
        'certificate_type': 'IELTS',
        'certificate_variant': 'ACADEMIC',
        'target_level': 'C1',
        'duration_seconds': 9600,
        'max_raw_score': 9.0,
        'pass_score': 7.0,
        'sections': [('LISTENING', 40, 4.5), ('READING', 40, 4.5)]
    }
]

for ex in exams:
    cur.execute("SELECT id FROM englow3.exams WHERE title = %s", (ex['title'],))
    existing = cur.fetchone()
    if existing:
        print(f"Exam '{ex['title']}' already exists, skipping.")
        continue

    exam_id = str(uuid.uuid4())
    cur.execute("""
        INSERT INTO englow3.exams (
            id, title, description, exam_type, certificate_type, certificate_variant,
            target_level, duration_seconds, max_raw_score, pass_score, status,
            version_number, created_by_user_id, published_at, created_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'PUBLISHED', 1, %s, %s, %s
        )
    """, (
        exam_id, ex['title'], ex['description'], ex['exam_type'], ex['certificate_type'],
        ex['certificate_variant'], ex['target_level'], ex['duration_seconds'],
        ex['max_raw_score'], ex['pass_score'], admin_id, now, now
    ))

    # Insert sections and question sets with batch insert for questions
    for s_idx, (sec_type, q_count, sec_score) in enumerate(ex['sections'], start=1):
        sec_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO englow3.exam_sections (
                id, exam_id, section_type, order_no, max_raw_score, is_scored_by_criteria
            ) VALUES (%s, %s, %s, %s, %s, false)
        """, (sec_id, exam_id, sec_type, s_idx, sec_score))

        part_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO englow3.section_parts (
                id, exam_section_id, order_no, title
            ) VALUES (%s, %s, %s, %s)
        """, (part_id, sec_id, 1, f"Part 1 - {sec_type}"))

        qset_id = str(uuid.uuid4())
        cur.execute("""
            INSERT INTO englow3.question_sets (
                id, section_part_id, order_no
            ) VALUES (%s, %s, 1)
        """, (qset_id, part_id))

        # Batch insert questions in 1 query
        q_rows = [
            (str(uuid.uuid4()), qset_id, 'SINGLE_CHOICE', f"Câu hỏi {qi + 1}", 'MEDIUM', sec_type, qi + 1, 1.0)
            for qi in range(q_count)
        ]
        execute_values(
            cur,
            """
            INSERT INTO englow3.questions (
                id, question_set_id, question_type, content, difficulty_level, skill_type, order_no, max_raw_score
            ) VALUES %s
            """,
            q_rows
        )

    print(f"Inserted exam '{ex['title']}' with {sum(s[1] for s in ex['sections'])} questions.")

conn.close()
print("All exams seeded successfully into PostgreSQL!")
