# Foundry Fund Me

A decentralized crowdfunding smart contract built with Foundry, enabling users to fund projects with ETH while ensuring minimum USD value contributions through Chainlink price feeds.

## 🚀 Features

- **Decentralized Crowdfunding**: Accept ETH contributions from multiple funders
- **USD Minimum Threshold**: Enforce minimum 5 USD contribution using real-time price feeds
- **Owner-Only Withdrawals**: Secure fund withdrawal restricted to contract owner
- **Price Conversion Library**: Modular price conversion utilities using Chainlink oracles
- **Comprehensive Testing**: Full test coverage with Foundry's testing framework
- **Multi-Network Deployment**: Configurable deployment scripts for different networks

## 📁 Project Structure

```
foundry-fund-me/
├── foundry.toml                 # Foundry configuration
├── Makefile                     # Build and test automation
├── script/                      # Deployment & interaction scripts
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
- [Node.js](https://nodejs.org/) (optional, for additional tooling)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imranpollob/foundry-fund-me.git
   cd foundry-fund-me
   ```

2. **Install dependencies**
   ```bash
   forge install
   ```

3. **Build the project**
   ```bash
   forge build
   ```

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

### Local Development (Anvil)

1. **Start local node**
   ```bash
   anvil
   ```

2. **Deploy to local network**
   ```bash
   forge script script/DeployFundMe.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key <YOUR_PRIVATE_KEY>
   ```

### Testnet/Mainnet Deployment

Update network configurations in `script/HelperConfig.sol`, then deploy:

```bash
# Sepolia testnet
forge script script/DeployFundMe.s.sol --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify

# Mainnet
forge script script/DeployFundMe.s.sol --rpc-url $MAINNET_RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 💡 Usage

### Funding the Contract

Send ETH to the contract address with a minimum value equivalent to 5 USD:

```solidity
// Contract automatically handles funding through receive/fallback
fundMe.fund{value: 0.01 ether}();
```

### Withdrawing Funds (Owner Only)

```solidity
fundMe.withdraw();
```

### Checking Contract State

```solidity
// Get minimum USD requirement
uint256 minUsd = fundMe.MINIMUM_USD();

// Get funder amount
uint256 amount = fundMe.s_funderToAmountFunded(funderAddress);

// Get all funders
address[] memory funders = fundMe.getFunders();
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

