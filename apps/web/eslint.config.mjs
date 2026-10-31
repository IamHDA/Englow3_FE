import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The session lives in HttpOnly cookies the server manages. A Supabase
      // client in the browser would need them readable, which is exactly what
      // was removed - sign-in and the rest go through /api/auth instead.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@supabase/ssr",
              importNames: ["createBrowserClient"],
              message:
                "The browser must not hold a Supabase session. Use the /api/auth routes (features/auth/api/authClient).",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/lib/graphql/generated/**",
  ]),
]);

export default eslintConfig;
