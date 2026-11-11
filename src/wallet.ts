import detectEthereumProvider from '@metamask/detect-provider'
import EthereumProvider from '@walletconnect/ethereum-provider'
import { BrowserProvider, formatEther } from 'ethers'

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
const CHAINS = [1, 56]

type WalletName = 'MetaMask' | 'WalletConnect'

type WalletConnection = {
  address: string
  chainId: number
  balance: string
  wallet: WalletName
}

type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

export async function connectMetaMask(): Promise<WalletConnection> {
  const provider = await detectEthereumProvider({
    mustBeMetaMask: true,
    silent: true,
  })

  if (!provider) {
    throw new Error('Please install MetaMask.')
  }

  const accounts = (await provider.request({
    method: 'eth_requestAccounts',
  })) as string[]

  if (!accounts.length) {
    throw new Error('No wallet account selected.')
  }

  return getWalletDetails(provider, accounts[0], 'MetaMask')
}

export async function connectWalletConnect(): Promise<WalletConnection> {
  if (!PROJECT_ID) {
    throw new Error('Missing WalletConnect Project ID.')
  }

  const provider = await EthereumProvider.init({
    projectId: PROJECT_ID,
    chains: CHAINS,
    showQrModal: true,
    metadata: {
      name: 'React dApp Tutorial',
      description: 'Ethereum and BNB Chain wallet',
      url: window.location.origin,
      icons: [],
    },
  })

  await provider.connect()

  const accounts = (await provider.request({
    method: 'eth_accounts',
  })) as string[]

  if (!accounts.length) {
    throw new Error('No wallet account connected.')
  }

  return getWalletDetails(provider, accounts[0], 'WalletConnect')
}

async function getWalletDetails(
  provider: Eip1193Provider,
  address: string,
  wallet: WalletName,
): Promise<WalletConnection> {
  const browserProvider = new BrowserProvider(provider as never)
  const network = await browserProvider.getNetwork()
  const balance = await browserProvider.getBalance(address)

  return {
    address,
    chainId: Number(network.chainId),
    balance: formatEther(balance),
    wallet,
  }
}

export async function switchNetwork(
  provider: Eip1193Provider,
  chainId: number,
): Promise<void> {
  if (!CHAINS.includes(chainId)) {
    throw new Error('Unsupported network.')
  }

  await provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: `0x${chainId.toString(16)}` }],
  })
}
