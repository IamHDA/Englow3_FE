import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AuthContext } from "@/features/auth/context";
import { useRecoverableForm } from "./useRecoverableForm";
const initial = { title: "" };
let owner = "first";
function wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        session: { userId: owner, email: null, role: "STAFF" },
        signOut: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
afterEach(() => {
  owner = "first";
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("form recovery", () => {
  it("recovers a draft only for its account and server baseline", async () => {
    const hook = renderHook(() => useRecoverableForm("task:1", initial), {
      wrapper,
    });
    await act(async () => {});
    act(() => hook.result.current.setValue({ title: "My unfinished task" }));
    await waitFor(() =>
      expect(localStorage.getItem("englow3-form:first:task:1")).toContain(
        "My unfinished task",
      ),
    );
    owner = "second";
    hook.rerender();
    expect(hook.result.current.value.title).toBe("");
    await act(async () => {});
    owner = "first";
    hook.rerender();
    await waitFor(() =>
      expect(hook.result.current.value.title).toBe("My unfinished task"),
    );
    expect(hook.result.current.restored).toBe(true);
  });
  it.each(["expired", "future", "corrupt", "different server version"])(
    "does not inject a %s draft into the form",
    async (reason) => {
      const record = {
        at:
          reason === "expired"
            ? Date.now() - 86400001
            : reason === "future"
              ? Date.now() + 60000
              : Date.now(),
        baseline: JSON.stringify(
          reason === "different server version"
            ? { title: "new version" }
            : initial,
        ),
        value:
          reason === "corrupt" ? { missing: "title" } : { title: "Old draft" },
      };
      localStorage.setItem("englow3-form:first:task:1", JSON.stringify(record));
      const hook = renderHook(() => useRecoverableForm("task:1", initial), {
        wrapper,
      });
      await act(async () => {});
      expect(hook.result.current.value).toEqual(initial);
      expect(hook.result.current.restored).toBe(false);
    },
  );
  it("keeps the edit and warns when local storage rejects a write", async () => {
    const hook = renderHook(() => useRecoverableForm("task:1", initial), {
      wrapper,
    });
    await act(async () => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    act(() => hook.result.current.setValue({ title: "Still here" }));
    await waitFor(() => expect(hook.result.current.storageError).toBe(true));
    expect(hook.result.current.value.title).toBe("Still here");
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    act(() => hook.result.current.markSaved());
    const after = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
  });
});
