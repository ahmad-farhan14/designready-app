const DB_NAME = 'DesignReadyDB';
const STORE_NAME = 'uploaded_files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'taskId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export type StoredFile = {
  name: string;
  type: string;
  data: ArrayBuffer;
  isZip?: boolean;
};

export async function saveFilesToDB(taskId: string, files: File[], isZip = false): Promise<void> {
  const db = await openDB();
  const filePromises = files.map(async (file) => ({
    name: file.name,
    type: file.type,
    data: await file.arrayBuffer(),
    isZip: isZip || file.name.toLowerCase().endsWith('.zip'),
  }));

  const fileData = await Promise.all(filePromises);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ taskId, files: fileData });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFilesFromDB(taskId: string): Promise<StoredFile[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(taskId);
    request.onsuccess = () => resolve(request.result?.files || []);
    request.onerror = () => reject(request.error);
  });
}

export async function clearFilesFromDB(taskId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(taskId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}