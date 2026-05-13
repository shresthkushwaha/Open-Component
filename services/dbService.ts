import { openDB, IDBPDatabase } from 'idb';
import { Component, ComponentFile } from '../types';

const DB_NAME = 'open-component-db';
const STORE_FILES = 'component_files';
const STORE_COMPONENTS = 'components';
const DB_VERSION = 2; // Bumped version for new schema

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 2) {
          // Clear old store if it exists (breaking change in schema)
          if (db.objectStoreNames.contains('interactions')) {
            db.deleteObjectStore('interactions');
          }
        }
        
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          const store = db.createObjectStore(STORE_FILES, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
        }
        
        if (!db.objectStoreNames.contains(STORE_COMPONENTS)) {
          const store = db.createObjectStore(STORE_COMPONENTS, { keyPath: 'id' });
          store.createIndex('fileId', 'fileId');
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

export const dbService = {
  // --- Files ---
  async getAllFiles(): Promise<ComponentFile[]> {
    const db = await getDB();
    const files = await db.getAllFromIndex(STORE_FILES, 'createdAt');
    return files.reverse(); // Newest first
  },

  async getFile(id: string): Promise<ComponentFile | undefined> {
    const db = await getDB();
    return db.get(STORE_FILES, id);
  },

  async saveFile(file: ComponentFile): Promise<void> {
    const db = await getDB();
    await db.put(STORE_FILES, file);
  },

  async deleteFile(id: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction([STORE_FILES, STORE_COMPONENTS], 'readwrite');
    
    // Delete file
    await tx.objectStore(STORE_FILES).delete(id);
    
    // Delete all components in file
    const componentStore = tx.objectStore(STORE_COMPONENTS);
    const index = componentStore.index('fileId');
    const componentKeys = await index.getAllKeys(id);
    for (const key of componentKeys) {
      await componentStore.delete(key);
    }
    
    await tx.done;
  },

  // --- Components ---
  async getComponentsForFile(fileId: string): Promise<Component[]> {
    const db = await getDB();
    const components = await db.getAllFromIndex(STORE_COMPONENTS, 'fileId', fileId);
    return components.sort((a, b) => b.timestamp - a.timestamp); // Newest first
  },

  async saveComponent(component: Component): Promise<void> {
    const db = await getDB();
    await db.put(STORE_COMPONENTS, component);
  },

  async deleteComponent(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_COMPONENTS, id);
  },

  async clearAll(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction([STORE_FILES, STORE_COMPONENTS], 'readwrite');
    await tx.objectStore(STORE_FILES).clear();
    await tx.objectStore(STORE_COMPONENTS).clear();
    await tx.done;
  }
};
