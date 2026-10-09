import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import express from "express";

import { env } from "./config/env.js";
import { corsMiddleware, rateLimitMiddleware } from "./config/middleware.js";
import { createContext, type GraphQLContext } from "./graphql/context.js";
import { formatError, logServerErrors } from "./graphql/errors.js";
import { queryLimitRule } from "./graphql/limits.js";
import { resolvers, typeDefs } from "./graphql/schema.js";
import { importRoute } from "./http/importRoute.js";
import { authoringRoute } from "./http/authoringRoute.js";

/**
 * The one place Express and Apollo are configured. The long-running server and
 * the Vercel function both call this, so a route or a limit added here exists
 * in both - which is the point: `/rest` once existed locally and not deployed.
 */
export async function createApp() {
  const apollo = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    formatError,
    plugins: [logServerErrors],
    validationRules: [queryLimitRule()],
    // The schema is in the repository for anyone building against it; a
    // deployed BFF has no reason to hand it to whoever asks.
    introspection: !env.production,
    // Apollo defaults this to true outside NODE_ENV=production, which would
    // put internal file paths in every client-visible error. Off always -
    // debug from server logs, not the response.
    includeStacktraceInErrorResponses: false,
  });
  await apollo.start();

  const app = express();
  app.set("trust proxy", env.trustProxyHops);
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
  app.use("/rest", corsMiddleware(), rateLimitMiddleware(), authoringRoute());

  return app;
}
