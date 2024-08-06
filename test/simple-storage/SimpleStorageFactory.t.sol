// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SimpleStorageHelper} from "../../src/simple-storage/SimpleStorageHelper.sol";
import {SimpleStorageFactory} from "../../src/simple-storage/SimpleStorageFactory.sol";
import {Test} from "forge-std/Test.sol";

contract SimpleStorageFactoryTest is Test {
    SimpleStorageFactory simpleStorageFactory = new SimpleStorageFactory();

    function testCreateSimpleStorageContract() public {
        for (uint256 i = 0; i < 5; i++) {
            simpleStorageFactory.createSimpleStorageContract();
        }

        uint256 index = 2;
        uint256 number = 5;
        simpleStorageFactory.setMyNumberFromContractIndex(index, number);
        assert(simpleStorageFactory.getMyNumberFromContractIndex(index) == number);
    }

    function testSetMyNumberHelper() public {
        simpleStorageFactory.useHelperToCreateSimpleStorageContract();
        uint256 index = 0;
        uint256 number = 5;
        simpleStorageFactory.setMyNumberFromContractIndex(index, number);

        // using the helper to generate new number
        SimpleStorageHelper simpleStorageHelper = new SimpleStorageHelper();
        simpleStorageHelper.setMyNumber(number);

        assert(simpleStorageFactory.getMyNumberFromContractIndex(index) == simpleStorageHelper.getMyNumber());
    }
}
