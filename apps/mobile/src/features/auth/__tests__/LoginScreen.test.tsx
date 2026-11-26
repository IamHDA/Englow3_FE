import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import LoginScreen from "@/app/(auth)/login";

const mockSignIn = jest.fn();
const mockResendConfirmation = jest.fn();

jest.mock("@/features/auth/AuthProvider", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithProvider: jest.fn(),
    resendConfirmation: mockResendConfirmation,
  }),
}));

jest.mock("expo-router", () => {
  const { Text } = jest.requireActual("react-native");
  const { createElement } = jest.requireActual("react");
  return {
    Link: ({ children }: { children: unknown }) =>
      createElement(Text, null, children),
  };
});

describe("LoginScreen", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockResendConfirmation.mockReset();
  });

  it("checks the fields before calling Supabase", async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByTestId("login-submit"));

    expect(await screen.findByText("Email không hợp lệ.")).toBeTruthy();
    expect(screen.getByText("Nhập mật khẩu.")).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("explains a wrong password in Vietnamese", async () => {
    mockSignIn.mockResolvedValue({ error: { code: "invalid_credentials" } });
    await render(<LoginScreen />);
    await fireEvent.changeText(
      screen.getByTestId("login-email"),
      " learner@example.com ",
    );
    await fireEvent.changeText(screen.getByTestId("login-password"), "secret");
    await fireEvent.press(screen.getByTestId("login-submit"));

    expect(
      await screen.findByText("Email hoặc mật khẩu không đúng."),
    ).toBeTruthy();
    expect(mockSignIn).toHaveBeenCalledWith("learner@example.com", "secret");
  });

  it("offers to resend the confirmation e-mail when the address is unconfirmed", async () => {
    mockSignIn.mockResolvedValue({ error: { code: "email_not_confirmed" } });
    mockResendConfirmation.mockResolvedValue({ error: null });
    await render(<LoginScreen />);
    await fireEvent.changeText(
      screen.getByTestId("login-email"),
      "learner@example.com",
    );
    await fireEvent.changeText(screen.getByTestId("login-password"), "secret");
    await fireEvent.press(screen.getByTestId("login-submit"));

    await fireEvent.press(await screen.findByText("Gửi lại thư xác nhận"));
    await waitFor(() =>
      expect(mockResendConfirmation).toHaveBeenCalledWith(
        "learner@example.com",
      ),
    );
    expect(
      await screen.findByText(
        "Đã gửi lại thư xác nhận. Kiểm tra hộp thư của bạn.",
      ),
    ).toBeTruthy();
  });
});
