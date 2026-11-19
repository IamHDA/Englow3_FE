/**
 * A stand-in for the account's profile that a test can change while a screen is
 * drawn: the screen subscribes to it the way it would to a context, and
 * `set` is the profile arriving (or failing). Used with `vi.mock` of
 * "@/features/account".
 */
export type FakeAccount = {
  profile: { id: string } | null;
  hasError: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function createAccountStore(initial: FakeAccount) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next: Partial<FakeAccount>) {
      value = { ...value, ...next };
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
