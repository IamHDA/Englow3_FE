// Values src/lib/env.ts insists on; nothing is contacted in tests.
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://placeholder.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "placeholder-key";
process.env.EXPO_PUBLIC_BFF_URL = "http://bff.test";
process.env.EXPO_PUBLIC_WEB_URL = "http://web.test";

jest.mock("@react-native-async-storage/async-storage", () =>
  // jest.mock factories run before imports, so the mock is loaded with require.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

// Native modules with no JavaScript fallback; screens only need them to exist.
jest.mock("expo-audio", () => {
  const player = {
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn(),
    setPlaybackRate: jest.fn(),
  };
  return {
    useAudioPlayer: () => player,
    useAudioPlayerStatus: () => ({
      playing: false,
      currentTime: 0,
      duration: 0,
      didJustFinish: false,
    }),
    useAudioStream: () => ({
      stream: { start: jest.fn(), stop: jest.fn() },
      isStreaming: false,
    }),
    setAudioModeAsync: jest.fn(async () => undefined),
    AudioModule: {
      requestRecordingPermissionsAsync: jest.fn(async () => ({
        granted: true,
      })),
    },
  };
});

jest.mock("expo-file-system", () => ({
  File: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    write: jest.fn(),
    bytes: jest.fn(async () => new Uint8Array()),
    uri: "file:///test",
  })),
  Paths: { cache: "file:///cache" },
}));
