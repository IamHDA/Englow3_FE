import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";

import { corsMiddleware, rateLimitMiddleware } from "./config/middleware.js";
import { createContext } from "./graphql/context.js";
import { formatError } from "./graphql/errors.js";
import { resolvers, typeDefs } from "./graphql/schema.js";
import { importRoute } from "./http/importRoute.js";

/**
 * The one place Express and Apollo are configured. The long-running server and
 * the Vercel function both call this, so a route or a limit added here exists
 * in both - which is the point: `/rest` once existed locally and not deployed.
 */
export async function createApp() {
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    formatError,
    // Apollo defaults this to true outside NODE_ENV=production, which would
    // put internal file paths in every client-visible error. Off always -
    // debug from server logs, not the response.
    includeStacktraceInErrorResponses: false,
  });
  await apollo.start();

  const app = express();
  app.use(
    "/graphql",
    corsMiddleware(),
    rateLimitMiddleware(),
    // The default 100kb body cap is stated rather than inherited: a GraphQL
    // document is kilobytes, and nothing here should accept a megabyte of it.
    express.json({ limit: "128kb" }),
    expressMiddleware(apollo, { context: createContext }),
  );

  // Content import goes over REST. A generated batch is a multi-megabyte file,
  // and raising the GraphQL body cap for every query to carry one upload would
  // be paying for the exception on every request.
  app.use("/rest", corsMiddleware(), rateLimitMiddleware(), importRoute());

  return app;
}
