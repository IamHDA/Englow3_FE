import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { resolvers } from "./graphql/resolvers.js";
import { typeDefs } from "./graphql/typeDefs.js";

export async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  const app = express();
  app.use("/graphql", cors(), express.json(), expressMiddleware(server));

  app.listen(env.port, () => {
    console.log(`BFF ready at http://localhost:${env.port}/graphql`);
  });
}
