export const env = {
  port: Number(process.env.PORT ?? 4000),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:8080",
};
