// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConversion.sol";

error FundMe_OnlyOwnerCanWithdrawTheFund();

// forge inspect FundMe storageLayout
contract FundMe {
    // using library
    using PriceConversion for uint;

    // State variables
    uint256 public constant MINIMUM_USD = 5e18; // 5 dollars
    address public immutable i_owner;
    address[] public s_funders;
    mapping(address funder => uint amount) public s_funderToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    // Events

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe_OnlyOwnerCanWithdrawTheFund();
        _;
    }

    /* Functions order
    contructor
    receive
    fallback
    external
    public
    internal
    private
    view / pure */

    // 0x694AA1769357215DE4FAC081bf1f309aDC325306
    constructor(address priceFeed) {
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            // getCoversionRate() takes two parameters
            // first one is msg.value, second one s_priceFeed
            msg.value.getCoversionRate(s_priceFeed) > MINIMUM_USD,
            "Didn't send enough ETH"
        );
        s_funders.push(msg.sender);
        s_funderToAmountFunded[msg.sender] += msg.value;
    }

    // gas: 87,388
    function withdraw() public onlyOwner {
        // this for loop is used to manually set the amount of mapping s_funderToAmountFunded as
        // in solidity it's not possible to reset a mapping
        // it's one of the main reason to have an array to track the size of mapping
        // ** mappings can't be in memory
        for (uint i; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_funderToAmountFunded[funder] = 0;
        }

        // resetting the array
        s_funders = new address[](0);

        // (bool callSuccess, bytes memory dataReturned)
        (bool callSuccess, ) = payable(i_owner).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // forge snapshot --match-contract FundMe
    // gas: 84,594 after using in memory funders
    // gas: 84,448 after using fundersLength variable
    function withdrawCheaper() public onlyOwner {
        uint fundersLength = s_funders.length;
        address[] memory funders = s_funders;

        for (uint i; i < fundersLength; i++) {
            address funder = funders[i];
            s_funderToAmountFunded[funder] = 0;
        }

        // resetting the array
        s_funders = new address[](0);

        // (bool callSuccess, bytes memory dataReturned)
        (bool callSuccess, ) = payable(i_owner).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getFunderToAmountFunded(
        address funderAddress
    ) public view returns (uint) {
        return s_funderToAmountFunded[funderAddress];
    }
}
