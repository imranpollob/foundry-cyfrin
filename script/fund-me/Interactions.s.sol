// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FundMe} from "src/fund-me/FundMe.sol";
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";

// forge script script/fund-me/Interactions.s.sol:Fund_FundMe --sender 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
contract Fund_FundMe is Script {
    uint256 SEND_VALUE = 0.1 ether;

    function fund_FundMe(address mostRecentlyDeployed) public {
        console.log("Funded FundMe contract", mostRecentlyDeployed, " with %s", SEND_VALUE);
        vm.startBroadcast();
        FundMe(payable(mostRecentlyDeployed)).fund{value: SEND_VALUE}();
        vm.stopBroadcast();
    }

    function run() external {
        address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment("FundMe", block.chainid);
        fund_FundMe(mostRecentlyDeployed);
    }
}

// contract Withdraw_FundMe is Script {
//     function withdraw_FundMe(address mostRecentlyDeployed) public {
//         vm.startBroadcast();
//         FundMe(payable(mostRecentlyDeployed)).withdraw();
//         vm.stopBroadcast();
//         console.log("Withdraw FundMe balance!");
//     }

//     function run() external {
//         address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment("FundMe", block.chainid);
//         withdraw_FundMe(mostRecentlyDeployed);
//     }
// }
