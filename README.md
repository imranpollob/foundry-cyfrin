## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Usage
```shell
### Build
forge build
### Test
forge test
### Format
forge fmt
### Gas Snapshots
forge snapshot
### Anvil
anvil
### Deploy
forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
### Cast
cast <subcommand>
### Remapping
forge remappings > remappings.txt
```


# Step by step project development

- Create project `forge init`
- Build the project `forge build`
- Add anvil network and account to metamask `anvil`
- Write the `SimpleStorage.sol`
- Deploy contract `forge create SimpleStorage --private-key KEY`
- Remove private key from your history in Bash `history -c`. Others `rm .bash_history .zsh_history`

Deploying using script
- Write deployment script `SimpleStorage.s.sol`. It should inherite `Script` from `forge-std/Script.sol` and have `setUp()` and `run()` functions
- Run the script `forge script script/SimpleStorage.s.sol`
- Deploying on anvil `forge script script/SimpleStorage.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key KEY` 
- A new broadcast folder will be created. Check run-latest.json file
- The `transaction` is sent to blockchain, `value` is the eth amount stored, `data` is the code, `nonce` is the counter of how many times the same transaction is deployed.
- To convert a hex to decimal like "gas": "0x6b0d2", run `cast to-dec 0x6b0d2`
- Don't use .env to store private key, use `cast wallet import the-key --interactive`
- See the private keys `cast wallet list`
- New script command `forge script script/SimpleStorage.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --account KEY_NAME --sender ACCOUNT_ADDRESS -vvvv`

Interect with the smart contract using cast 
- setMyNumber `cast send CONTRACT_ADDRESS "setMyNumber(uint256)" 12345 --rpc-url http://127.0.0.1:8545 --private-key KEY`
- getMyNumber `cast call CONTRACT_ADDRESS "getMyNumber()" --rpc-url http://127.0.0.1:8545`
- Convert the hex to decimal `cast to-dec HEX_CODE`

Test
- Write a test script `SimpleStorage.t.sol`. It should inherite `Test` from `forge-std/Test.sol` and have `setUp()` and `testMETHOD()` functions
- Run test `forge test -vvvv`
- Run a specific test function `forge test --match-test REGEX`
- Run a specific contract `forge test --match-contract REGEX`

Calldata vs Memory
- Memory variables are modifiable, calldata variables are not.