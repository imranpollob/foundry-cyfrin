// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PriceConversion.sol";

error FundMe_OnlyOwnerCanWithdrawTheFund();

// Deployed Sepolia 0x6EcadFa3F430330a54F9eb6598a0D2a86ECC7A0B
contract FundMe {
    using PriceConversion for uint;
    uint256 public constant MINIMUM_USD = 5e18; // 5 dollars
    // call gas cost from contracts
    // gas * gas price = total cost / eth price = dollar price 
    // non-constant 2424 * 7000000000 = 16,968,000,000,000 = 0.055
    // constant     325 * 7000000000  =  2,275,000,000,000 = 0.0073
    address[] public funders;
    mapping (address funder => uint amount) public funderToAmountFunded;
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        require(msg.value.getCoversionRate() > MINIMUM_USD, "Didn't send enough ETH");
        funders.push(msg.sender);
        funderToAmountFunded[msg.sender] = funderToAmountFunded[msg.sender] + msg.value;
    }

    function withdraw() public onlyOwner {
        // this for loop is used to manually set the amount of mapping funderToAmountFunded as
        // in solidity it's not possible to reset a mapping
        // it's one of the main reason to have an array to track the size of mapping
        for (uint i; i < funders.length; i++) {
            address funder = funders[i];
            funderToAmountFunded[funder] = 0;
        }
        
        // resetting the array
        funders = new address[](0);
        
        // transfer 
        // payable(msg.sender).transfer(address(this).balance);
        
        // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        
        // call 
        // (bool callSuccess, bytes memory dataReturned)
        (bool callSuccess,) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert OnlyOwnerCanWithdrawTheFund();
        // require(msg.sender == i_owner, "Only owner can withdraw the fund");
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable { 
        fund();
    }
}