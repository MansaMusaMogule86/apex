import { useCallback, useEffect, useRef, useState } from 'react'

export type LiveDataMode = 'loading' | 'persisted' | 'demo' | 'empty' | 'error'

interface UseResilientLiveDataOptions<T> {
  loadPersisted: () => Promise<T>
  buildDemoData?: () => T | null
  isEmpty: (value: T) => boolean
  onLiveConnected?: () => void
}

interface RetryOptions {
  keepExistingDemoData: boolean
  source: 'initial' | 'manual' | 'online'
}

export interface ResilientLiveDataState<T> {
  mode: LiveDataMode
  data: T | null
  recoverableError: string | null
  isRetrying: boolean
  loadLiveData: () => Promise<void>
  retryLiveData: () => Promise<void>
}

function toErrorMessage(reason: unknown) {
  if (reason instanceof Error && reason.message.trim().length > 0) return reason.message
  return String(reason)
}

export function useResilientLiveData<T>(options: UseResilientLiveDataOptions<T>): ResilientLiveDataState<T> {
  const { buildDemoData, isEmpty, loadPersisted, onLiveConnected } = options
  const [mode, setMode] = useState<LiveDataMode>('loading')
  const [data, setData] = useState<T | null>(null)
  const [recoverableError, setRecoverableError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [autoRetriedOnReconnect, setAutoRetriedOnReconnect] = useState(false)
  const modeRef = useRef<LiveDataMode>('loading')

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const runLoad = useCallback(
    async ({ keepExistingDemoData, source }: RetryOptions) => {
      setIsRetrying(source !== 'initial')
      if (source === 'initial') {
        setMode('loading')
      }

      try {
        const persisted = await loadPersisted()
        if (persisted == null) {
          throw new Error('Live API returned an empty response.')
        }
        const nextMode: LiveDataMode = isEmpty(persisted) ? 'empty' : 'persisted'
        const recoveredFromDemo = modeRef.current === 'demo'

        setData(persisted)
        setRecoverableError(null)
        setMode(nextMode)
        setAutoRetriedOnReconnect(false)

        if (recoveredFromDemo) {
          onLiveConnected?.()
        }
      } catch (reason) {
        const message = toErrorMessage(reason)
        const demoData = buildDemoData?.() ?? null

        if (demoData) {
          setData((previous) => {
            if (keepExistingDemoData && modeRef.current === 'demo' && previous) return previous
            return demoData
          })
          setRecoverableError(message)
          setMode('demo')
          setAutoRetriedOnReconnect(false)
          return
        }

        setData(null)
        setRecoverableError(message)
        setMode('error')
      } finally {
        setIsRetrying(false)
      }
    },
    [buildDemoData, isEmpty, loadPersisted, onLiveConnected],
  )

  const loadLiveData = useCallback(async () => {
    await runLoad({ keepExistingDemoData: false, source: 'initial' })
  }, [runLoad])

  const retryLiveData = useCallback(async () => {
    await runLoad({ keepExistingDemoData: true, source: 'manual' })
  }, [runLoad])

  useEffect(() => {
    const onOnline = () => {
      if (modeRef.current !== 'demo' || autoRetriedOnReconnect) return
      setAutoRetriedOnReconnect(true)
      void runLoad({ keepExistingDemoData: true, source: 'online' })
    }

    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [autoRetriedOnReconnect, runLoad])

  return {
    mode,
    data,
    recoverableError,
    isRetrying,
    loadLiveData,
    retryLiveData,
  }
}
