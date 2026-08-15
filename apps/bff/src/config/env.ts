export const env = {
  port: Number(process.env.PORT ?? 4000),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8080",
  // Covers starting the backend call, not finishing async backend work.
  backendTimeoutMs: Number(process.env.BACKEND_TIMEOUT_MS ?? 10000),
};
