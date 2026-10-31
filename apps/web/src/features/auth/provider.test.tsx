import { MantineProvider } from "@mantine/core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useContext } from "react";
import { AuthProvider } from "./provider";
import { AuthContext } from "./context";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  refresh: vi.fn(),
  show: vi.fn(),
  update: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("./api/authClient", () => ({ signOutOfServer: () => mocks.signOut() }));
vi.mock("./api/sessionSync", () => ({
  announceSessionChange: vi.fn(),
  onSessionChangeElsewhere: () => () => {},
}));
vi.mock("@/shared/storage/browserDrafts", () => ({
  clearBrowserDrafts: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@mantine/notifications", () => ({
  notifications: { show: mocks.show, update: mocks.update },
}));
function Consumer() {
  const auth = useContext(AuthContext)!;
  return (
    <button onClick={() => void auth.signOut()} disabled={auth.isSigningOut}>
      {auth.isSigningOut ? "pending" : "logout"}
    </button>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.show.mockReturnValue("logout-toast");
});

it("shares pending state, prevents duplicate sign-out and reports response errors", async () => {
  let finish!: (value: { error: { status: number } }) => void;
  mocks.signOut.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  render(
    <MantineProvider>
      <AuthProvider initialSession={null}>
        <Consumer />
      </AuthProvider>
    </MantineProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "logout" }));
  expect(screen.getByRole("button", { name: "pending" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "pending" }));
  await waitFor(() => expect(mocks.signOut).toHaveBeenCalledOnce());
  await act(async () => {
    finish({ error: { status: 500 } });
  });
  expect(screen.getByRole("button", { name: "logout" })).not.toBeDisabled();
  expect(mocks.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ color: "red", loading: false }),
  );
  expect(mocks.refresh).toHaveBeenCalledOnce();
});
