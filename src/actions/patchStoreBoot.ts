import { patchStoreWithSupabase } from './patchStore'
queueMicrotask(() => { patchStoreWithSupabase().catch(() => {}) })
