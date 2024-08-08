# Foundry Projects

Resources:
- https://github.com/Cyfrin/foundry-full-course-f23
- https://github.com/Cyfrin/security-and-auditing-full-course-s23


## Foudry Fundamentals and Advanced Foundry
1.  [x] 🔧 **Foundry Fundamentals Section 1:** Foundry Simple Storage
2.  [x] 💰 **Foundry Fundamentals Section 2:** Foundry Fund Me
3.  [ ] 🌐 **Foundry Fundamentals Section 3:** Html/Js Fund Me (Quick Fullstack / Front End Tutorial)
4.  [ ] 🎲 **Foundry Fundamentals Section 4:** Foundry Smart Contract Lottery
5.  [ ] 🪙 **Advanced Foundry Section 1:** Foundry ERC20s
6.  [ ] 🎨 **Advanced Foundry Section 2:** Foundry NFTs | MoodNFT
7.  [ ] 💸 **Advanced Foundry Section 3:** Foundry DeFi | Stablecoin (The PINNACLE PROJECT!! GET HERE!)
8.  [ ] 🎁 **Advanced Foundry Section 4:** Foundry Merkle Airdrop and Signatures
9.  [ ] 🚀 **Advanced Foundry Section 5:** Foundry Upgrades
10. [ ] 🛠️ **Advanced Foundry Section 6:** Foundry Account Abstraction
11. [ ] 🗳️ **Advanced Foundry Section 7:** Foundry DAO / Governance
12. [ ] 🔐 **Advanced Foundry Section 8:** Smart Contract Security & Auditing (For developers)


## Smart Contract Security Auditing
0. [x] 🤗 Section 0: Welcome to the Course
1. [ ] 🐸 Section 1: Review (Don't skip)
2. [ ] ❓ Section 2: What is a smart contract audit (Security Review)?
3. [ ] ⛳️ Section 3: Your first audit | PasswordStore Audit
4. [ ] 🐶 Section 4: Manual & Static Analysis | Puppy Raffle Audit
5. [ ] 🔄 Section 5: Invariants & Intro to DeFi | TSwap Audit
6. [ ] 🌩️ Section 6: Centralization, Proxies, and Oracles | Thunder Loan Audit
7. [ ] 🌉 Section 7: Bridges, Chains, Signatures, Intro to Yul/Assembly | Bridge Boss Audit
8. [ ] 🛡️ Section 8: (THE FINAL BOSS AUD**-IT) MEV, Nodes, & DAOs | Vault Guardians Audit


## VSCode Configuration
To use `forge fmt` as default formatter for solidity:
- CTRL + SHIFT + P
- Open User Settings (JSON)
- Add this line `"solidity.formatter": "forge"`

Used extensions
- Solidity - Nomic Foundation


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
