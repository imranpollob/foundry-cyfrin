// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {FundMe} from "./../../src/fund-me/FundMe.sol";

contract FundMeTest is Test {
    FundMe fundMe;

    function setUp() external {
        fundMe = new FundMe(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }

    function testMinimumUsdIsFive() public view {
        assert(fundMe.MINIMUM_USD() == 5e18);
    }

    function testOwner() public {
        console.log(fundMe.i_owner());
        console.log(msg.sender);
        // for FundMe, FundMeTest is the msg.sender not us
        assert(fundMe.i_owner() == address(this));
    }
}
