// R01: local-first storage for PUBLIC projections only. No session token,
// invoice, grant, profile or private response enters this database. Browser
// storage can be unavailable/evicted; the static artifact remains a fallback.
import { type PublicSnapshot, publicSnapshot } from './model'

const databaseName = 'onlyjah-public-constellation-v1'
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () =>
      request.result.createObjectStore('snapshots')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
export async function readPublicCache(
  scope: string,
): Promise<PublicSnapshot | null> {
  let db: IDBDatabase | undefined
  try {
    db = await open()
    const current = db
    const value = await new Promise<unknown>((resolve, reject) => {
      const request = current
        .transaction('snapshots', 'readonly')
        .objectStore('snapshots')
        .get(scope)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return value ? publicSnapshot(value) : null
  } catch {
    return null
  } finally {
    db?.close()
  }
}
export async function writePublicCache(
  scope: string,
  value: PublicSnapshot,
): Promise<boolean> {
  let db: IDBDatabase | undefined
  try {
    db = await open()
    const current = db
    await new Promise<void>((resolve, reject) => {
      const transaction = current.transaction('snapshots', 'readwrite')
      transaction.objectStore('snapshots').put(publicSnapshot(value), scope)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
    return true
  } catch {
    return false
  } finally {
    db?.close()
  }
}
