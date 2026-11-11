import { useState } from 'react'
import './App.css'
import { connectMetaMask, connectWalletConnect } from './wallet'

type WalletConnection = Awaited<ReturnType<typeof connectMetaMask>>

const App = () => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const connect = async (connector: typeof connectMetaMask) => {
    setConnecting(true)
    setError(null)

    try {
      setWallet(await connector())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Wallet connection failed.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <main className="App">
      <h1>Connect a wallet</h1>
      {!wallet ? (
        <div className="connect-actions">
          <button disabled={connecting} onClick={() => void connect(connectMetaMask)}>
            Connect MetaMask
          </button>
          <button disabled={connecting} onClick={() => void connect(connectWalletConnect)}>
            Connect WalletConnect
          </button>
        </div>
      ) : (
        <section className="wallet-info" aria-live="polite">
          <p><strong>Connected with:</strong> {wallet.wallet}</p>
          <p><strong>Address:</strong> <code>{wallet.address}</code></p>
          <p><strong>Chain ID:</strong> {wallet.chainId}</p>
          <p><strong>Native balance:</strong> {wallet.balance}</p>
          <button onClick={() => setWallet(null)}>Disconnect</button>
        </section>
      )}
      {connecting && <p>Connecting…</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </main>
  )
}

export default App
