import time
import requests
import json

# Log in with demo user via Supabase REST API to get a real valid access_token
supabase_url = "https://jwqiedfdcjqbyyyemicb.supabase.co"
anon_key = "sb_publishable_4yLc0Hg6y5Rn6_bYTLNfTw_RAST63Zc" # from web .env.local

print("Authenticating with demo user...")
auth_res = requests.post(
    f"{supabase_url}/auth/v1/token?grant_type=password",
    headers={"apikey": anon_key, "Content-Type": "application/json"},
    json={"email": "demo_tester_englow3@gmail.com", "password": "Password123!"}
)
print("Auth status:", auth_res.status_code)
if auth_res.status_code != 200:
    print("Auth response:", auth_res.text)
    exit(1)

token = auth_res.json().get("access_token")
print("Obtained access token (len:", len(token), ")")

# 1. Test direct backend call: GET /api/exams?examType=MOCK&page=0&size=8
print("\n--- Testing Direct Spring Boot Backend (GET /api/exams) ---")
for i in range(3):
    t0 = time.time()
    r = requests.get(
        "http://localhost:8080/api/exams?examType=MOCK&page=0&size=8",
        headers={"Authorization": f"Bearer {token}"}
    )
    dt = (time.time() - t0) * 1000
    print(f"Direct BE Run {i+1}: status={r.status_code}, time={dt:.1f}ms")

# 2. Test BFF call: Query.exams
query = """
query ExamLibrary($examType: ExamType, $page: Int, $size: Int) {
  exams(examType: $examType, page: $page, size: $size) {
    items {
      id
      title
      targetLevel
      durationSeconds
      questionCount
    }
    totalItems
    totalPages
  }
}
"""
print("\n--- Testing Apollo BFF (POST /graphql Query.exams) ---")
for i in range(3):
    t0 = time.time()
    r = requests.post(
        "http://localhost:4000/graphql",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"query": query, "variables": {"examType": "MOCK", "page": 0, "size": 8}}
    )
    dt = (time.time() - t0) * 1000
    print(f"BFF Run {i+1}: status={r.status_code}, time={dt:.1f}ms")

# 3. Test Profile query: Query.currentUser
profile_query = """
query CurrentUser {
  currentUser {
    id
    email
    fullName
    displayName
    targetLevel
  }
}
"""
print("\n--- Testing Apollo BFF (POST /graphql Query.currentUser) ---")
for i in range(3):
    t0 = time.time()
    r = requests.post(
        "http://localhost:4000/graphql",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"query": profile_query}
    )
    dt = (time.time() - t0) * 1000
    print(f"BFF Profile Run {i+1}: status={r.status_code}, time={dt:.1f}ms")
