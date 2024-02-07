// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SimpleStorage} from "../src/SimpleStorage.sol";
import {SimpleStorageFactory} from "../src/SimpleStorageFactory.sol";
import {Test} from "forge-std/Test.sol";

contract SimpleStorageFactoryTest is Test {
    SimpleStorageFactory simpleStorageFactory = new SimpleStorageFactory();

    function testCreateSimpleStorageContract() public {
        for (uint256 i = 0; i < 5; i++) {
            simpleStorageFactory.createSimpleStorageContract();
        }

        uint index = 2;
        uint number = 5;
        simpleStorageFactory.setMyNumberFromContractIndex(index, number);
        assert(
            simpleStorageFactory.getMyNumberFromContractIndex(index) == number
        );
    }
}
