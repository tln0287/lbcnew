import { createContext, useCallback, useContext } from 'react'
import { ApiError, api } from '../../lib/api'

export const AuthCtx = createContext<{ username: string; signedOut: () => void }>({ username: '', signedOut: () => {} })

/** api() for /api/admin/*: a 401 anywhere sends the admin back to the sign-in form. */
export function useAdminApi() {
  const { signedOut } = useContext(AuthCtx)
  return useCallback(
    async <T,>(path: string, init?: Parameters<typeof api>[1]) => {
      try {
        return await api<T>(`/admin${path}`, init)
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) signedOut()
        throw e
      }
    },
    [signedOut],
  )
}
