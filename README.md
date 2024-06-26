# Foundry Projects
This repositiry contains the projects from [Cyfrin Foundry Course](https://github.com/Cyfrin/foundry-full-course-f23)

## Projects
1. [x] Simple Storage
2. [ ] Fund me 
3. [ ] Fund me frontend
4. [ ] Lottery
5. [ ] ERC20
6. [ ] NFT
7. [ ] Stable Coin
8. [ ] Ungradeable Smart contract
9. [ ] DAO
10. [ ] Security


## Foundry intro
Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.

Foundry consists of:
-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Command line tool for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Basic usage
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
### Test chain
anvil
```


# Step by step project development

## Creating project
- Create project `forge init`
- Build the project `forge build`
- Add anvil network and account to metamask `anvil`
- Write the `SimpleStorage.sol`
- Deploy contract `forge create SimpleStorage --private-key KEY`
- Remove private key from your history in Bash `history -c`. Others `rm .bash_history .zsh_history`

## Deploying using script
- Write deployment script `SimpleStorage.s.sol`. It should inherite `Script` from `forge-std/Script.sol` and have `setUp()` and `run()` functions
- Run the script `forge script script/SimpleStorage.s.sol`
- Deploying on anvil `forge script script/SimpleStorage.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key KEY` 
- A new broadcast folder will be created. Check run-latest.json file
- The `transaction` is sent to blockchain, `value` is the eth amount stored, `data` is the code, `nonce` is the counter of how many times the same transaction is deployed.
- To convert a hex to decimal like "gas": "0x6b0d2", run `cast to-dec 0x6b0d2`
- Don't use .env to store private key, use `cast wallet import the-key --interactive`
- See the private keys `cast wallet list`
- New script command `forge script script/SimpleStorage.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --account KEY_NAME --sender ACCOUNT_ADDRESS -vvvv`

## Interecting with the smart contract
- setMyNumber `cast send CONTRACT_ADDRESS "setMyNumber(uint256)" 12345 --rpc-url http://127.0.0.1:8545 --private-key KEY`
- getMyNumber `cast call CONTRACT_ADDRESS "getMyNumber()" --rpc-url http://127.0.0.1:8545`
- Convert the hex to decimal `cast to-dec HEX_CODE`

## Testing
- Write a test script `SimpleStorage.t.sol`. It should inherite `Test` from `forge-std/Test.sol` and have `setUp()` and `testMETHOD()` functions
- Run test `forge test -vvvv`
- Run a specific test function `forge test --match-test REGEX`
- Run a specific contract `forge test --match-contract REGEX`



# Knowledge base

<details>
<summary>Calldata vs Memory</summary>

| Aspect        | Calldata                                 | Memory                                           |
| ------------- | ---------------------------------------- | ------------------------------------------------ |
| Mutability    | Immutable                                | Mutable                                          |
| Usage         | Function arguments are passed through it | Used for temporary data storage and manipulation |
| Efficiency    | Efficient for reading                    | Efficient for data manipulation                  |
| Modifiability | Cannot be modified                       | Can be modified during contract execution        |
| Persistence   | Data is not persistent                   | Data is not persistent                           |
| Clearing      | N/A                                      | Cleared between function calls                   |
| Size          | Limited                                  | Dynamic                                          |


</details>


<details>
<summary>Inheritence</summary>

- To make a method overrideable make it `virtual`
- A contract can inherite another using `is` operator
- Add `override` modifier to the child contract method
</details>


<details>
<summary>Transfer vs Send vs Call</summary>

| Feature          | send                                  | transfer                            | call                                      |
|------------------|---------------------------------------|-------------------------------------|-------------------------------------------|
| **Syntax**       | `address.send(uint256 amount) returns (bool)` | `address.transfer(uint256 amount)` | `address.call{value: uint256}(bytes memory data) returns (bool, bytes memory)` |
| **Gas Limit**    | 2300 (only for logging)               | 2300 (only for logging)             | All available gas or a specific amount    |
| **Error Handling** | Returns `false` on failure           | Throws an exception on failure      | Returns a boolean value and allows access to returned data |
| **Use Case**     | Low-level method for sending Ether, requires explicit failure handling | Automatically reverts on failure, used for simple Ether transfers | Flexible method for sending Ether and calling functions on contracts, requires explicit error handling |
| **Security**     | Safer against reentrancy attacks due to gas limit | Safer against reentrancy attacks due to automatic revert on failure | Requires careful error handling to avoid security pitfalls like reentrancy attacks |
</details>
