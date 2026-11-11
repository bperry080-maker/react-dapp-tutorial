/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ethereum?: {
    isMetaMask?: boolean
    request(args: { method: string; params?: unknown[] }): Promise<unknown>
    on?(event: string, listener: (...args: unknown[]) => void): void
    removeListener?(event: string, listener: (...args: unknown[]) => void): void
  }
}
