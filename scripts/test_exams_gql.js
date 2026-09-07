async function test() {
  const authRes = await fetch(
    "https://jwqiedfdcjqbyyyemicb.supabase.co/auth/v1/token?grant_type=password",
    {
      method: "POST",
      headers: {
        apikey: "sb_publishable_4yLc0Hg6y5Rn6_bYTLNfTw_RAST63Zc",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "demo_learner_done@gmail.com",
        password: "Password123!",
      }),
    },
  );
  const authData = await authRes.json();
  const token = authData.access_token;
  console.log("Got token:", token ? "YES" : "NO");

  const gqlRes = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query TestExams {
          exams(page: 0, size: 10) {
            totalItems
            totalPages
            items {
              id
              title
              description
              examType
              certificateType
              certificateVariant
              targetLevel
              durationSeconds
              maxRawScore
              passScore
              questionCount
              status
              publishedAt
              bestScore
              attemptStatus
            }
          }
        }
      `,
    }),
  });
  const gqlData = await gqlRes.json();
  console.log("GQL Result:", JSON.stringify(gqlData, null, 2));
}

test().catch(console.error);
