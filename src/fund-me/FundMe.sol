// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {console} from "forge-std/Script.sol";
error NotOwner();

contract FundMe {
    mapping(address => uint) public addressToAmountFunded;
    address[] public funders;
    address public immutable owner;
    uint public constant MINIMUM_AMOUNT = 1 * 10 ** 18;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    function fund() public payable {
        require(msg.value >= MINIMUM_AMOUNT, "Not enough ETH sent");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for (uint i = 0; i < funders.length; i++) {
            addressToAmountFunded[funders[i]] = 0;
        }
        console.log("sender address", address(msg.sender));
        // reset funders array
        funders = new address[](0);

        // transfer
        // payable(msg.sender).transfer(address(this).balance);

        // send
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "Send failed");

        // call
        (bool success, ) = payable(owner).call{value: address(this).balance}("");
        require(success, "Call failed");
    }

    // msg.data ? receive() : fallback()
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
