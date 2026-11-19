import { CombinedGraphQLErrors } from "@apollo/client";

/** The error a mutation rejects with when the BFF passes on a backend refusal: its own code, and the backend's in `backendCode`. */
export function refusal(backendCode: string, code = "BAD_USER_INPUT") {
  return new CombinedGraphQLErrors({
    errors: [{ message: "refused", extensions: { code, backendCode } }],
  });
}
