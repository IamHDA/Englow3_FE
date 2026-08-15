import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { createContext } from "./graphql/context.js";
import { formatError } from "./graphql/errors.js";
import { resolvers, typeDefs } from "./graphql/schema.js";

export async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    // Apollo defaults this to true outside NODE_ENV=production, which would
    // put internal file paths in every client-visible error. Off always -
    // debug from server logs, not the response.
    includeStacktraceInErrorResponses: false,
  });
  await server.start();

  const app = express();
  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, { context: createContext }),
  );

  app.listen(env.port, () => {
    console.log(`BFF ready at http://localhost:${env.port}/graphql`);
  });
}
