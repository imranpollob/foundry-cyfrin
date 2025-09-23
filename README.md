# Foundry Fund Me

A decentralized crowdfunding smart contract built with Foundry, enabling users to fund projects with ETH while ensuring minimum USD value contributions through Chainlink price feeds.

## 🚀 Features

- **Decentralized Crowdfunding**: Accept ETH contributions from multiple funders
- **USD Minimum Threshold**: Enforce minimum 5 USD contribution using real-time price feeds
- **Owner-Only Withdrawals**: Secure fund withdrawal restricted to contract owner
- **Price Conversion Library**: Modular price conversion utilities using Chainlink oracles
- **Comprehensive Testing**: Full test coverage with Foundry's testing framework
- **Multi-Network Deployment**: Configurable deployment scripts for different networks
- **React Frontend**: Modern web interface for interacting with the smart contract

## 🏁 Quick Start

Follow these steps to get the project running locally:

### 1. Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (latest version)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)

### 2. Clone and Install
```bash
git clone https://github.com/imranpollob/foundry-fund-me.git
cd foundry-fund-me

# Install Foundry dependencies
forge install

# Install frontend dependencies
npm run install:frontend

# Build the smart contracts
forge build
```

### 3. Start Local Blockchain
```bash
# Start Anvil (local Ethereum node)
anvil
```
This will start a local blockchain at `http://127.0.0.1:8545` with 10 pre-funded accounts.

### 4. Deploy Smart Contract
In a new terminal (keep Anvil running):
```bash
# Deploy to local network
npm run deploy:local
```
This deploys the FundMe contract to your local blockchain and saves the deployment info.

### 5. Generate Frontend ABI
After building the contracts, extract the ABI for the frontend:
```bash
# Extract ABI from compiled contract
npm run extract:abi
```

### 6. Configure Frontend Environment
Create a `.env` file in the `frontend/` directory with your contract addresses:
```bash
# For local development
VITE_CONTRACT_ADDRESS_31337=0xYourDeployedLocalAddress

# For Sepolia testnet (optional)
VITE_CONTRACT_ADDRESS_11155111=0xYourSepoliaAddress

# For Polygon Amoy (optional)
VITE_CONTRACT_ADDRESS_80002=0xYourAmoyAddress
```

### 7. Run Frontend
```bash
# Start the development server
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the dApp.

### Alternative: Using Testnet
For testnet deployment instead of local:

1. Set up environment variables (`.env` file):
   ```
   SEPOLIA_RPC_URL=your_sepolia_rpc_url
   PRIVATE_KEY=your_private_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

2. Deploy to Sepolia:
   ```bash
   npm run deploy:sepolia
   ```

3. Update the `frontend/.env` file with the deployed contract address:
   ```
   VITE_CONTRACT_ADDRESS_11155111=0xYourDeployedSepoliaAddress
   ```

## 📁 Project Structure

```
foundry-fund-me/
├── foundry.toml                 # Foundry configuration
├── Makefile                     # Build and test automation
├── script/                      # Deployment & interaction scripts
├── src/                         # Smart contract source code
├── test/                        # Test files
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── contracts.ts         # Contract addresses and ABI import
│   │   ├── FundMeAbi.json       # Contract ABI (generated)
│   │   ├── wagmi.ts            # Web3 configuration
│   │   ├── App.tsx             # Main React component
│   │   └── ...
│   ├── package.json
│   └── .env                    # Environment variables (create this)
└── README.md
│   ├── DeployFundMe.s.sol       # Main deployment script
│   ├── HelperConfig.sol         # Network configuration helper
│   └── Interactions.s.sol       # Contract interaction utilities
├── src/                         # Smart contracts
│   ├── FundMe.sol               # Main crowdfunding contract
│   ├── PriceConversion.sol      # Price conversion library
│   └── FunWithStorage.sol       # Storage demonstration contract
├── test/                        # Test suites
│   ├── mock/                    # Mock contracts for testing
│   │   └── MockV3Aggregator.sol # Chainlink price feed mock
│   └── unit/                    # Unit tests
│       └── FundMeTest.t.sol     # FundMe contract tests
└── lib/                         # External dependencies
    ├── chainlink-brownie-contracts/
    ├── forge-std/
    └── foundry-devops/
```

## 🛠️ Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) (latest version)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)

## 🧪 Testing

Run the complete test suite:
```bash
forge test
```

Run tests with verbose output:
```bash
forge test -vvv
```

Run specific test contract:
```bash
forge test --match-contract FundMeTest
```

Run specific test function:
```bash
forge test --match-test testMinimumUsdIsFive
```

## 🚀 Deployment

For local development, follow the Quick Start guide above.

### Testnet/Mainnet Deployment

Set up environment variables in a `.env` file:
```
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
MAINNET_RPC_URL=your_mainnet_rpc_url
```

Deploy to testnet:
```bash
npm run deploy:sepolia
```

For mainnet deployment, update network configurations in `script/HelperConfig.sol` and use:
```bash
forge script script/DeployFundMe.s.sol --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 🌐 Frontend

A modern React application for interacting with the FundMe smart contract.

### Tech Stack
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Wagmi** - Ethereum interaction library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

### Features
- **Wallet Connection**: Connect MetaMask or other Web3 wallets
- **Fund Contract**: Send ETH to fund the contract (minimum $5 USD worth)
- **View Contract Data**: See contract balance, total funders, and your contributions
- **Owner Actions**: Contract owner can withdraw all funds
- **Multi-Network Support**: Works on Ethereum Mainnet, Sepolia testnet, and Polygon Amoy

### Usage
1. **Connect Wallet**: Click "Connect MetaMask" to connect your wallet
2. **Fund Contract**: Enter an amount in ETH and click "Fund" (must be ≥ $5 USD worth)
3. **View Data**: See contract balance, your contributions, and total funders
4. **Withdraw (Owner Only)**: If you're the contract owner, you can withdraw all funds

### Frontend Project Structure
```
frontend/
├── src/
│   ├── contracts.ts      # Contract addresses and ABI import
│   ├── FundMeAbi.json    # Contract ABI (auto-generated)
│   ├── wagmi.ts         # Wagmi configuration
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── package.json
├── .env                 # Environment variables (create this)
└── tailwind.config.js
```

### Frontend Scripts
- `npm run dev:frontend` - Start development server
- `npm run build:frontend` - Build for production
- `npm run start:frontend` - Start development server (alias for dev)

### Configuration
The frontend uses environment variables for contract addresses. Create a `.env` file in the `frontend/` directory:

```bash
# Local development
VITE_CONTRACT_ADDRESS_31337=0xYourLocalContractAddress

# Sepolia testnet
VITE_CONTRACT_ADDRESS_11155111=0xYourSepoliaContractAddress

# Polygon Amoy
VITE_CONTRACT_ADDRESS_80002=0xYourAmoyContractAddress
```

## 🔧 Development

### Code Formatting
```bash
forge fmt
```

### Gas Snapshots
```bash
forge snapshot
```

### VS Code Setup
For Solidity formatting with Forge:
- Open User Settings (JSON)
- Add: `"solidity.formatter": "forge"`

Recommended extensions:
- Solidity - Nomic Foundation
- Foundry - Nomic Foundation

## 📚 Contract Architecture

### FundMe.sol
- **Constructor**: Initializes with Chainlink price feed address
- **fund()**: Accepts ETH contributions with USD minimum check
- **withdraw()**: Owner-only function to withdraw all funds
- **getFunders()**: Returns array of all funder addresses
- **getVersion()**: Returns Chainlink price feed version

### PriceConversion.sol
- **getPrice()**: Fetches latest ETH/USD price from Chainlink
- **getConversionRate()**: Converts ETH amount to USD value

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Security

This is a learning project. Before using in production:
- Conduct thorough security audits
- Test extensively on testnets
- Consider additional access controls
- Implement timelocks for withdrawals
- Add emergency pause functionality

## 📞 Support

For questions or issues, please open a [GitHub issue](https://github.com/imranpollob/foundry-fund-me/issues).

