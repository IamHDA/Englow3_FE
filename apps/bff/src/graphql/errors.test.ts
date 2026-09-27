import { ApolloServer } from "@apollo/server";
import { GraphQLError } from "graphql";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { GraphQLContext } from "./context.js";
import { formatError, logServerErrors } from "./errors.js";
import { BackendError } from "../shared/http/backendError.js";
import { makeContext } from "../test/makeContext.js";

describe("formatError", () => {
  it("maps a 401 BackendError to UNAUTHENTICATED without leaking the backend message", () => {
    const backendError = new BackendError(
      "some internal detail from Spring Boot",
      401,
      "AUTH_MISSING",
      "trace-1",
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.message).toBe("Missing or invalid access token");
    expect(result.message).not.toContain("Spring Boot");
    expect(result.extensions).toEqual({
      code: "UNAUTHENTICATED",
      backendCode: "AUTH_MISSING",
      traceId: "trace-1",
    });
  });

  it("passes the backend's domain code through as backendCode without its message", () => {
    const backendError = new BackendError(
      "Section scores total 195 but the paper declares 200",
      409,
      "EXAM_SCORE_MISMATCH",
      "trace-2",
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.message).toBe(
      "The request could not be completed due to a conflict",
    );
    expect(result.message).not.toContain("195");
    expect(result.extensions).toEqual({
      code: "CONFLICT",
      backendCode: "EXAM_SCORE_MISMATCH",
      traceId: "trace-2",
    });
  });

  it("maps a 500 BackendError to a generic internal error, not a passthrough", () => {
    const backendError = new BackendError(
      "NullPointerException at com.englow3.UserService.findById",
      500,
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.message).toBe("An unexpected error occurred");
    expect(result.message).not.toContain("NullPointerException");
    expect(result.extensions).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("maps a network-level failure (status 0) to BACKEND_UNAVAILABLE", () => {
    const backendError = new BackendError(
      "Failed to reach the backend service",
      0,
    );
    const original = new GraphQLError("wrapped", {
      originalError: backendError,
    });

    const result = formatError(
      { message: "wrapped", extensions: {} },
      original,
    );

    expect(result.extensions).toMatchObject({ code: "BACKEND_UNAVAILABLE" });
  });

  it("passes through errors that are not BackendError unchanged", () => {
    const formatted = {
      message: "Missing or invalid access token",
      extensions: { code: "UNAUTHENTICATED" },
    };
    const original = new GraphQLError("Missing or invalid access token", {
      extensions: { code: "UNAUTHENTICATED" },
    });

    const result = formatError(formatted, original);

    expect(result).toBe(formatted);
  });

  // Apollo files anything nobody classified under INTERNAL_SERVER_ERROR, message
  // and all. The message of a TypeError names a property of our own objects.
  it("does not pass on the message of an error nobody classified", () => {
    const original = new GraphQLError("Cannot read properties of undefined", {
      originalError: new TypeError("Cannot read properties of undefined"),
    });

    const result = formatError(
      {
        message: "Cannot read properties of undefined",
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      },
      original,
    );

    expect(result).toEqual({
      message: "An unexpected error occurred",
      extensions: { code: "INTERNAL_SERVER_ERROR" },
    });
  });

  it("keeps the message of the errors a client is meant to read", () => {
    for (const code of [
      "UNAUTHENTICATED",
      "FORBIDDEN",
      "BAD_USER_INPUT",
      "GRAPHQL_VALIDATION_FAILED",
    ]) {
      const formatted = { message: "why", extensions: { code } };

      expect(formatError(formatted, new GraphQLError("why"))).toBe(formatted);
    }
  });
});

describe("errors through Apollo", () => {
  const server = new ApolloServer<GraphQLContext>({
    typeDefs: "type Query { boom: String backend(status: Int!): String }",
    resolvers: {
      Query: {
        boom: () => {
          throw new TypeError("secret detail of our own objects");
        },
        backend: (_: unknown, { status }: { status: number }) => {
          throw new BackendError(
            "NullPointerException at com.englow3.UserService",
            status,
            "SOME_CODE",
            "trace-7",
          );
        },
      },
    },
    formatError,
    plugins: [logServerErrors],
  });
  let logged: ReturnType<typeof vi.spyOn>;

  beforeAll(() => server.start());
  afterAll(() => server.stop());
  beforeEach(() => {
    logged = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  async function run(query: string) {
    const response = await server.executeOperation(
      { query },
      { contextValue: makeContext() },
    );
    if (response.body.kind !== "single") throw new Error("expected single");
    return response.body.singleResult;
  }

  it("tells the client nothing of an unexpected error, and logs all of it against the request", async () => {
    const result = await run("query Boom { boom }");

    expect(result.errors?.[0]?.message).toBe("An unexpected error occurred");
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(logged).toHaveBeenCalledTimes(1);
    expect(JSON.parse(logged.mock.calls[0][0] as string)).toMatchObject({
      requestId: "req-test",
      where: "graphql Boom boom",
      type: "TypeError",
      message: "secret detail of our own objects",
    });
  });

  it("logs a backend failure with its status and trace id", async () => {
    const result = await run("{ backend(status: 500) }");

    expect(result.errors?.[0]?.message).toBe("An unexpected error occurred");
    expect(JSON.parse(logged.mock.calls[0][0] as string)).toMatchObject({
      status: 500,
      backendCode: "SOME_CODE",
      traceId: "trace-7",
    });
  });

  // Not the server's doing: a 404 is the caller asking for what is not there,
  // and a query that does not validate is the caller's to fix.
  it("does not log what the caller did wrong", async () => {
    const notFound = await run("{ backend(status: 404) }");
    const invalid = await run("{ nope }");

    expect(notFound.errors?.[0]?.extensions?.code).toBe("NOT_FOUND");
    expect(invalid.errors?.[0]?.message).toContain('Cannot query field "nope"');
    expect(logged).not.toHaveBeenCalled();
  });
});
