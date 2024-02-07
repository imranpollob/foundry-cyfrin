// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {SimpleStorage} from "./SimpleStorage.sol";

// Inheriheted SimpleStorage
contract SimpleStorageHelper is SimpleStorage {
    // override the virtual method
    function setMyNumber(uint _num) public override {
        myNumber = _num + 5;
    }
}
