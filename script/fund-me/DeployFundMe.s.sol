// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {FundMe} from "./../../src/fund-me/FundMe.sol";
import {HelperConfig} from "./HelperConfig.sol";

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
