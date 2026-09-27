import { createApp } from "./app.js";
import { env } from "./config/env.js";

export async function startServer() {
  const app = await createApp();

  app.listen(env.port, () => {
    console.log(`BFF ready at http://localhost:${env.port}/graphql`);
  });
}
