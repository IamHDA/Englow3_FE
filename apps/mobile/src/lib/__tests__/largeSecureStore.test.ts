import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { LargeSecureStore } from "../largeSecureStore";

describe("LargeSecureStore", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("returns what was stored, including values far over SecureStore's 2 KB limit", async () => {
    const store = new LargeSecureStore();
    const session = JSON.stringify({
      token: "x".repeat(5000),
      user: { id: "u1" },
    });

    await store.setItem("sb-session", session);

    expect(await store.getItem("sb-session")).toBe(session);
  });

  it("never writes the session itself in clear text", async () => {
    const store = new LargeSecureStore();
    await store.setItem("sb-session", "secret-access-token");

    const raw = await AsyncStorage.getItem("sb-session");
    expect(raw).not.toBeNull();
    expect(raw).not.toContain("secret-access-token");
    // Only the 32-byte key (64 hex characters) goes to the keystore.
    expect(await SecureStore.getItemAsync("sb-session")).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it("treats a missing key as signed out rather than failing", async () => {
    const store = new LargeSecureStore();
    await store.setItem("sb-session", "value");
    await SecureStore.deleteItemAsync("sb-session");

    expect(await store.getItem("sb-session")).toBeNull();
  });

  it("removes both halves", async () => {
    const store = new LargeSecureStore();
    await store.setItem("sb-session", "value");
    await store.removeItem("sb-session");

    expect(await AsyncStorage.getItem("sb-session")).toBeNull();
    expect(await SecureStore.getItemAsync("sb-session")).toBeNull();
  });
});
