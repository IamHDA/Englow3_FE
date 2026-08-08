import { loginWithSupabase } from "../services/auth.js";

export const resolvers = {
  Query: {
    health: () => "ok",
  },
  Mutation: {
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      return await loginWithSupabase(email, password);
    },
  },
};

