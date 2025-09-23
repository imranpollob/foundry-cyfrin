import { fundMeAbi } from './FundMeAbi.js'

export { fundMeAbi }

// Contract addresses for different networks
export const contractAddresses = {
  // Local Anvil
  31337: import.meta.env.VITE_CONTRACT_ADDRESS_31337 || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
} as const

// Minimum funding amount in USD (5 USD)
export const MINIMUM_USD = 5