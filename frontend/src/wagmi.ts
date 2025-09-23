import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygonAmoy } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Define local Anvil network
const anvil = {
  id: 31337,
  name: 'Anvil',
  network: 'anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local', url: 'http://127.0.0.1:8545' },
  },
  testnet: true,
}

export const config = createConfig({
  chains: [mainnet, sepolia, polygonAmoy, anvil],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [anvil.id]: http(),
  },
  ssr: true, // Enable server-side rendering support
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}