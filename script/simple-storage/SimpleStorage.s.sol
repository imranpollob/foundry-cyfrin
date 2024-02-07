// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleStorage} from "../../src/simple-storage/SimpleStorage.sol";

// Note the contract name is different
contract SimpleStorageScript is Script {
    function setUp() public {}

    // Note the return isn't necesary. see the return type
    function run() public returns (SimpleStorage) {
        vm.startBroadcast();
        SimpleStorage simpleStorage = new SimpleStorage();
        vm.stopBroadcast();
        // Note you can't log a class instance, need to convert to an address
        console.log("The address is ", address(simpleStorage));
        return simpleStorage;
    }
}
