# FundMe Frontend

A React-based frontend for the FundMe smart contract, built with modern web technologies.

## Features

- **Wallet Connection**: Connect with MetaMask or other Web3 wallets
- **Fund Contract**: Send ETH to fund the contract (minimum $5 USD worth)
- **View Contract Data**: See contract balance, total funders, and your contributions
- **Owner Actions**: Contract owner can withdraw all funds
- **Multi-Network Support**: Works on Ethereum Mainnet, Sepolia testnet, and Polygon Amoy

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Wagmi** - Ethereum interaction library
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **TypeScript** - Type safety

## Getting Started

### Prerequisites

- Node.js 18+
- A Web3 wallet (MetaMask recommended)
- Test ETH on Sepolia or Polygon Amoy for testing

### Installation

1. Install dependencies:
```bash
npm run install:frontend
```

2. Start the development server:
```bash
npm run dev:frontend
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build:frontend
```

## Usage

1. **Connect Wallet**: Click "Connect MetaMask" to connect your wallet
2. **Fund Contract**: Enter an amount in ETH and click "Fund" (must be ≥ $5 USD worth)
3. **View Data**: See contract balance, your contributions, and total funders
4. **Withdraw (Owner Only)**: If you're the contract owner, you can withdraw all funds

## Contract Addresses

Update the contract addresses in `src/contracts.ts` for your deployed contracts:

```typescript
export const contractAddresses = {
  11155111: "0xYourSepoliaContractAddress",
  80002: "0xYourAmoyContractAddress",
  31337: "0xYourLocalContractAddress"
}
```

## Development

### Project Structure

```
frontend/
├── src/
│   ├── contracts.ts      # Contract ABI and addresses
│   ├── wagmi.ts         # Wagmi configuration
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── package.json
└── tailwind.config.js
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see the main project LICENSE file for details.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
