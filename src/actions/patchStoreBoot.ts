import { patchStoreWithSupabase } from './patchStore'
try {
  // allow store to initialize first
  queueMicrotask(() => patchStoreWithSupabase())
} catch {
  // noop
}
