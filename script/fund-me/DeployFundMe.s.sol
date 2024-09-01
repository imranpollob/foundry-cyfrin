// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {FundMe} from "./../../src/fund-me/FundMe.sol";
import {HelperConfig} from "./HelperConfig.sol";

// forge script script/fund-me/DeployFundMe.s.sol:DeployFundMe --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
contract DeployFundMe is Script {
    // forge script script/fund-me/DeployFundMe.s.sol

    function run() external returns (FundMe) {
        // this config is getting the network based pricefeed address
        HelperConfig helperConfig = new HelperConfig();
        address priceFeed = helperConfig.activeNetworkConfig();

        vm.startBroadcast();
        FundMe fundMe = new FundMe(priceFeed);
        vm.stopBroadcast();
        return fundMe;
    }
}
