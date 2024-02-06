// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract SimpleStorage {
    address owner;
    struct Person {
        string name;
        uint age;
    }
    Person[] public listOfPeople;
    mapping(address => int) public addressOfPeople;

    function setOwner(address _addr) public {
        owner = _addr;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function addPerson(string memory _name, uint _age) public {
        listOfPeople.push(Person(_name, _age));
    }
}
