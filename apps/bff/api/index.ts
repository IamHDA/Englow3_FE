import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { createContext } from "../src/graphql/context.js";
import { formatError } from "../src/graphql/errors.js";
import { resolvers, typeDefs } from "../src/graphql/schema.js";

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError,
  includeStacktraceInErrorResponses: false,
});

app.use(cors());
app.use(express.json());

let isStarted = false;

app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!isStarted) {
    await server.start();
    isStarted = true;
  }
  return (expressMiddleware(server, { context: createContext }) as any)(
    req,
    res,
    next,
  );
});

export default app;
