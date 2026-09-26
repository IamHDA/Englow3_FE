import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const envPath = path.resolve("../Englow3_BE/.env");
const envVars = { ...process.env };

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      envVars[key] = val;
    }
  }
}

// Make sure Supabase audience / issuer / jwks are set
if (!envVars.SUPABASE_ISSUER_URI) {
  envVars.SUPABASE_ISSUER_URI =
    "https://jwqiedfdcjqbyyyemicb.supabase.co/auth/v1";
}
if (!envVars.SUPABASE_JWKS_URI) {
  envVars.SUPABASE_JWKS_URI =
    "https://jwqiedfdcjqbyyyemicb.supabase.co/auth/v1/.well-known/jwks.json";
}

// Bypass Flyway checksum mismatch caused by CRLF / local edits
envVars.SPRING_FLYWAY_VALIDATE_ON_MIGRATE = "false";

console.log("Starting Spring Boot Backend with DB_URL:", envVars.DB_URL);

const child = spawn(
  "mvn.cmd",
  ["-f", "../Englow3_BE/pom.xml", "spring-boot:run"],
  {
    env: envVars,
    stdio: "inherit",
    shell: true,
  },
);

child.on("error", (err) => {
  console.error("Failed to start Spring Boot:", err);
});

child.on("exit", (code) => {
  console.log("Spring Boot exited with code:", code);
});
