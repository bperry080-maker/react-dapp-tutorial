import { useCallback, useEffect, useState } from 'react'
import {
  connectMetaMask,
  connectWalletConnect,
  getWalletDetails,
  switchNetwork,
  type WalletConnection,
} from './wallet'
import './App.css'

function App() {
  const [wallet, setWallet] = useState<WalletConnection | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const refreshMetaMask = useCallback(async () => {
    const provider = window.ethereum
    if (!provider) return

    try {
      const accounts = (await provider.request({ method: 'eth_accounts' })) as string[]
      if (!accounts.length) {
        setWallet((current) => current?.wallet === 'MetaMask' ? null : current)
        return
      }

      const result = await getWalletDetails(provider, accounts[0], 'MetaMask')
      setWallet((current) => current?.wallet === 'MetaMask' ? result : current)
    } catch {
      setError('Could not refresh the MetaMask account or balance.')
    }
  }, [])

  useEffect(() => {
    const provider = window.ethereum
    if (!provider?.isMetaMask) return

    const refresh = () => { void refreshMetaMask() }
    provider.on?.('accountsChanged', refresh)
    provider.on?.('chainChanged', refresh)

    return () => {
      provider.removeListener?.('accountsChanged', refresh)
      provider.removeListener?.('chainChanged', refresh)
    }
  }, [refreshMetaMask])

  async function connect(type: 'MetaMask' | 'WalletConnect') {
    setLoading(true)
    setError('')

    try {
      const result = type === 'MetaMask'
        ? await connectMetaMask()
        : await connectWalletConnect()
      setWallet(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  async function changeNetwork(chainId: number) {
    const provider = window.ethereum
    if (!provider?.isMetaMask) {
      setError('MetaMask is unavailable.')
      return
    }

    setError('')
    try {
      await switchNetwork(provider, chainId)
      await refreshMetaMask()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network switch failed')
    }
  }

  return (
    <main className="App">
      <h1>My Web3 Wallet</h1>

      <div className="connect-actions">
        <button disabled={loading} onClick={() => void connect('MetaMask')}>
          Connect MetaMask
        </button>
        <button disabled={loading} onClick={() => void connect('WalletConnect')}>
          Connect WalletConnect
        </button>
      </div>

      {loading && <p>Connecting wallet...</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {wallet && (
        <section className="wallet-info" aria-live="polite">
          <h2>Wallet Connected</h2>
          <p><strong>Wallet:</strong> {wallet.wallet}</p>
          <p><strong>Address:</strong> <code>{wallet.address}</code></p>
          <p><strong>Network:</strong> {
            wallet.chainId === 1
              ? 'Ethereum Mainnet'
              : wallet.chainId === 56
                ? 'BNB Smart Chain'
                : `Chain ${wallet.chainId}`
          }</p>
          <p><strong>Native balance:</strong> {wallet.balance}</p>

          {wallet.wallet === 'MetaMask' && (
            <div className="connect-actions">
              <button disabled={loading} onClick={() => void changeNetwork(1)}>
                Ethereum Mainnet
              </button>
              <button disabled={loading} onClick={() => void changeNetwork(56)}>
                BNB Chain
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
