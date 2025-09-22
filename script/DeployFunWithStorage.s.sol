// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {FunWithStorage} from "./../../src/fund-me/FunWithStorage.sol";

contract DeployFunWithStorage is Script {
    // forge script script/fund-me/DeployFunWithStorage.s.sol
    function run() external returns (FunWithStorage) {
        vm.startBroadcast();
        FunWithStorage funWithStorage = new FunWithStorage();
        vm.stopBroadcast();
        printStorageData(address(funWithStorage));
        printFirstArrayElement(address(funWithStorage));
        return funWithStorage;
    }

    function printStorageData(address contractAddress) public view {
        for (uint256 i = 0; i < 10; i++) {
            bytes32 value = vm.load(contractAddress, bytes32(i));
            console.log("Value at location", i, ":");
            console.logBytes32(value);
        }
    }

    function printFirstArrayElement(address contractAddress) public view {
        bytes32 arrayStorageSlotLength = bytes32(uint256(2));
        bytes32 firstElementStorageSlot = keccak256(
            abi.encode(arrayStorageSlotLength)
        );
        bytes32 value = vm.load(contractAddress, firstElementStorageSlot);
        console.log("First element in array:");
        console.logBytes32(value);
    }
}
