"use client";

type StorageArea = "localStorage" | "sessionStorage";

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function logStorageWarning(action: string, storageArea: StorageArea, key: string, error: unknown) {
  if (!isDevelopment()) {
    return;
  }

  const normalizedError =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : { name: "UnknownError", message: String(error) };

  console.warn(`[safe-browser-storage] ${action} failed`, {
    storageArea,
    key,
    error: normalizedError
  });
}

function getStorage(storageArea: StorageArea): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window[storageArea];
  } catch (error) {
    logStorageWarning("access", storageArea, "__storage__", error);
    return null;
  }
}

function safeGet(storageArea: StorageArea, key: string) {
  const storage = getStorage(storageArea);

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch (error) {
    logStorageWarning("getItem", storageArea, key, error);
    return null;
  }
}

function safeSet(storageArea: StorageArea, key: string, value: string) {
  const storage = getStorage(storageArea);

  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, value);
    return true;
  } catch (error) {
    logStorageWarning("setItem", storageArea, key, error);
    return false;
  }
}

function safeRemove(storageArea: StorageArea, key: string) {
  const storage = getStorage(storageArea);

  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    logStorageWarning("removeItem", storageArea, key, error);
    return false;
  }
}

export function safeSessionStorageGet(key: string) {
  return safeGet("sessionStorage", key);
}

export function safeSessionStorageSet(key: string, value: string) {
  return safeSet("sessionStorage", key, value);
}

export function safeSessionStorageRemove(key: string) {
  return safeRemove("sessionStorage", key);
}

export function safeLocalStorageGet(key: string) {
  return safeGet("localStorage", key);
}

export function safeLocalStorageSet(key: string, value: string) {
  return safeSet("localStorage", key, value);
}

export function safeLocalStorageRemove(key: string) {
  return safeRemove("localStorage", key);
}
