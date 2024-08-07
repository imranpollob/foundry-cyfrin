// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SimpleStorage} from "./SimpleStorage.sol";
import {SimpleStorageHelper} from "./SimpleStorageHelper.sol";

contract SimpleStorageFactory {
    SimpleStorage[] collectionOfSimpleStorages;

    function createSimpleStorageContract() public {
        collectionOfSimpleStorages.push(new SimpleStorage());
    }

    function getMyNumberFromContractIndex(uint256 index) public view returns (uint256) {
        return collectionOfSimpleStorages[index].getMyNumber();
    }

    function setMyNumberFromContractIndex(uint256 index, uint256 number) public {
        collectionOfSimpleStorages[index].setMyNumber(number);
    }

    function useHelperToCreateSimpleStorageContract() public {
        collectionOfSimpleStorages.push(new SimpleStorageHelper());
    }
}
