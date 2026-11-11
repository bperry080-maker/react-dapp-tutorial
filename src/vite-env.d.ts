/// <reference types="vite/client" />

import type { Eip1193Provider } from './wallet'

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean
      on?: (event: string, callback: (...args: any[]) => void) => void
      removeListener?: (
        event: string,
        callback: (...args: any[]) => void
      ) => void
    }
  }
}

export {}
