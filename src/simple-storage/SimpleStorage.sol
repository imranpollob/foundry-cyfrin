// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint myNumber;
    struct Person {
        string name;
        uint age;
    }
    Person[] public listOfPeople;

    // Note making it virtual to become overridable
    function setMyNumber(uint _num) public virtual {
        myNumber = _num;
    }

    function getMyNumber() public view returns (uint) {
        return myNumber;
    }

    // Note memory variables are modifiable, calldata variables are not.
    function addPerson(string memory _name, uint _age) public {
        listOfPeople.push(Person(_name, _age));
    }
}
