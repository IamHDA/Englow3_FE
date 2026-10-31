export const FORM_DRAFT_PREFIX = "englow3-form:";
const DATABASE = "englow3-audio-drafts";
const STORE = "recordings";
let generation = 0;
export type RecordingDraft = {
  key: string;
  blob: Blob;
  clientKey: string;
  at: number;
  seconds: number;
};

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined")
      return reject(new Error("Browser storage unavailable"));
    const request = indexedDB.open(DATABASE, 1);
    let rejected = false;
    request.onsuccess = () => {
      if (rejected) {
        request.result.close();
        return;
      }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE))
        request.result.createObjectStore(STORE, { keyPath: "key" });
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      rejected = true;
      reject(new Error("Browser storage blocked"));
    };
  });
}
async function operation<T>(
  mode: IDBTransactionMode,
  perform: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await open();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      const request = perform(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
export async function loadRecording(
  key: string,
): Promise<RecordingDraft | null> {
  await pruneRecordings();
  const value = await operation<RecordingDraft | undefined>(
    "readonly",
    (store) => store.get(key),
  );
  if (!value) return null;
  if (
    typeof value.at !== "number" ||
    value.at > Date.now() ||
    Date.now() - value.at > 86400000 ||
    !(value.blob instanceof Blob) ||
    typeof value.clientKey !== "string" ||
    !Number.isFinite(value.seconds) ||
    value.seconds <= 0 ||
    value.seconds > 301
  ) {
    await removeRecording(key);
    return null;
  }
  return value;
}
export function saveRecording(value: RecordingDraft) {
  const expected = generation;
  return operation("readwrite", (store) => {
    if (expected !== generation) throw new Error("Session changed");
    return store.put(value);
  });
}
export function removeRecording(key: string) {
  return operation("readwrite", (store) => store.delete(key));
}
export async function clearBrowserDrafts() {
  generation++;
  try {
    for (const key of Object.keys(localStorage))
      if (
        key.startsWith(FORM_DRAFT_PREFIX) ||
        key.startsWith("englow3_exam_attempt_")
      )
        localStorage.removeItem(key);
  } catch {
    /* Storage can be restricted. */
  }
  try {
    for (const key of Object.keys(sessionStorage))
      if (
        key.startsWith("englow-writing:") ||
        key.startsWith("englow3_exam_attempt_")
      )
        sessionStorage.removeItem(key);
  } catch {
    /* Storage can be restricted. */
  }
  try {
    await operation("readwrite", (store) => store.clear());
  } catch {
    /* No database or storage disabled. */
  }
}
async function pruneRecordings() {
  const database = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      const cursor = transaction.objectStore(STORE).openCursor();
      cursor.onsuccess = () => {
        const row = cursor.result;
        if (!row) return;
        const at = row.value.at;
        if (
          typeof at !== "number" ||
          at > Date.now() ||
          Date.now() - at > 86400000
        )
          row.delete();
        row.continue();
      };
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}
