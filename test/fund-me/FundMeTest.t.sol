// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {FundMe} from "./../../src/fund-me/FundMe.sol";
import {DeployFundMe} from "./../../script/fund-me/DeployFundMe.s.sol";

// forge test --match-contract FundMeTest -vvv
contract FundMeTest is Test {
    FundMe fundMe;

    function setUp() external {
        // fundMe = new FundMe(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        DeployFundMe deployFundMe = new DeployFundMe();
        fundMe = deployFundMe.run();
    }

    function testMinimumUsdIsFive() public view {
        assert(fundMe.MINIMUM_USD() == 5e18);
    }

    function testOwner() public view {
        console.log(fundMe.i_owner());
        console.log(msg.sender);
        // for FundMe, FundMeTest is the msg.sender not us
        assert(fundMe.i_owner() == address(this));
    }

    // forge test --match-test testPriceFeedVersion -vvvv
    // It will throw error
    // as we don't have access to sepolia's deployed AggregatorV3Interface address
    // 0x694AA1769357215DE4FAC081bf1f309aDC325306::version() [staticcall]
    // forge test --match-test testPriceFeedVersion -vvv --rpc-url https://1rpc.io/sepolia
    function testPriceFeedVersion() public view {
        assert(fundMe.getVersion() == 4);
    }
}
