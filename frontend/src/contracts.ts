import fundMeAbi from './FundMeAbi.json'

export { fundMeAbi }

// Contract addresses for different networks
export const contractAddresses = {
  // Local Anvil
  31337: import.meta.env.VITE_CONTRACT_ADDRESS_31337,
  // Sepolia
  11155111: import.meta.env.VITE_CONTRACT_ADDRESS_11155111,
  // Polygon Amoy
  80002: import.meta.env.VITE_CONTRACT_ADDRESS_80002
} as const

// Minimum funding amount in USD (5 USD)
export const MINIMUM_USD = 5