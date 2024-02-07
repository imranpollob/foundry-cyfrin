// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/Script.sol";
import {SimpleStorage} from "../../src/simple-storage/SimpleStorage.sol";
import {SimpleStorageScript} from "../../script/simple-storage/SimpleStorage.s.sol";

contract SimpleStorageTest is Test {
    SimpleStorage simpleStorage = new SimpleStorage();

    function setUp() public {
        // Note may use script to deploy
        // SimpleStorageScript simpleStorageScript = new SimpleStorageScript();
        // simpleStorage = simpleStorageScript.run();
    }

    function testMyNumber() public {
        uint number = 123;
        simpleStorage.setMyNumber(number);
        assert(simpleStorage.getMyNumber() == number);
    }

    function testListofPeople() public {
        string memory name = "Guy";
        uint age = 28;
        
        simpleStorage.addPerson(name, age);
        
        // Note using () instead of [], because we are accessing the array from outside of the
        // contract using getter function. As listOfPeople is public, it has a default getter 
        (string memory _name, uint _age) = simpleStorage.listOfPeople(0);
        console.log("Person:", _name, _age);
        
        // Note string matching is not possible in this way
        // the reason is string is a dynamically sized byte array (bytes)
        //assert(name == _name);
        
        assert(keccak256(abi.encodePacked(name)) == keccak256(abi.encodePacked(_name)));
        assert(age == _age);
    }
}
