// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelperConfig {
    struct NetworkConfig {
        address priceFeed;
    }

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (block.chainid == 11155111) {
            activeNetworkConfig = getSepoliaConfig();
        } else if (block.chainid == 80002) {
            activeNetworkConfig = getAmoyConfig();
        } else {
            
        }
    }

    function getSepoliaConfig() public pure returns (NetworkConfig memory) {
        return
            NetworkConfig({
                priceFeed: 0x694AA1769357215DE4FAC081bf1f309aDC325306
            });
    }
    
    function getAmoyConfig() public pure returns (NetworkConfig memory) {
        return
            NetworkConfig({
                priceFeed: 0xF0d50568e3A7e8259E16663972b11910F89BD8e7
            });
    }
}
