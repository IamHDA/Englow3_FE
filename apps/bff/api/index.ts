import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { typeDefs } from "../src/graphql/typeDefs.js";
import { resolvers } from "../src/graphql/resolvers.js";

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });

app.use(cors());
app.use(express.json());

let isStarted = false;

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!isStarted) {
    await server.start();
    isStarted = true;
  }
  return (expressMiddleware(server) as any)(req, res, next);
});

export default app;
