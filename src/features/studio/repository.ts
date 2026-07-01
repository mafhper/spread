import type { SpreadDocumentV1, SpreadPresetV1 } from '../composition/document'

const DATABASE_NAME = 'spread-studio-v1'
const DATABASE_VERSION = 1
const DRAFTS_STORE = 'drafts'
const PRESETS_STORE = 'presets'
const CURRENT_DRAFT_ID = 'current'

interface StoredDraft {
  id: string
  document: SpreadDocumentV1
  updatedAt: number
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

async function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is not available in this browser')
  }

  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
  request.onupgradeneeded = () => {
    const database = request.result
    if (!database.objectStoreNames.contains(DRAFTS_STORE)) {
      database.createObjectStore(DRAFTS_STORE, { keyPath: 'id' })
    }
    if (!database.objectStoreNames.contains(PRESETS_STORE)) {
      database.createObjectStore(PRESETS_STORE, { keyPath: 'id' })
    }
  }
  return requestResult(request)
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const database = await openDatabase()
  try {
    const transaction = database.transaction(storeName, mode)
    const result = await operation(transaction.objectStore(storeName))
    await transactionDone(transaction)
    return result
  } finally {
    database.close()
  }
}

export interface StudioRepository {
  loadDraft(): Promise<SpreadDocumentV1 | null>
  saveDraft(document: SpreadDocumentV1): Promise<void>
  clearDraft(): Promise<void>
  listPresets(): Promise<SpreadPresetV1[]>
  savePreset(preset: SpreadPresetV1): Promise<void>
  deletePreset(id: string): Promise<void>
}

export const studioRepository: StudioRepository = {
  async loadDraft() {
    const draft = await withStore<StoredDraft | undefined>(
      DRAFTS_STORE,
      'readonly',
      store => requestResult(store.get(CURRENT_DRAFT_ID))
    )
    return draft?.document?.schema === 'spread-document@1'
      ? draft.document
      : null
  },

  async saveDraft(document) {
    await withStore(DRAFTS_STORE, 'readwrite', async store => {
      await requestResult(
        store.put({
          id: CURRENT_DRAFT_ID,
          document,
          updatedAt: Date.now(),
        } satisfies StoredDraft)
      )
    })
  },

  async clearDraft() {
    await withStore(DRAFTS_STORE, 'readwrite', async store => {
      await requestResult(store.delete(CURRENT_DRAFT_ID))
    })
  },

  async listPresets() {
    return withStore(PRESETS_STORE, 'readonly', store =>
      requestResult(store.getAll())
    )
  },

  async savePreset(preset) {
    await withStore(PRESETS_STORE, 'readwrite', async store => {
      await requestResult(store.put(preset))
    })
  },

  async deletePreset(id) {
    await withStore(PRESETS_STORE, 'readwrite', async store => {
      await requestResult(store.delete(id))
    })
  },
}
