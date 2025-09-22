// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {FundMe} from "src/fund-me/FundMe.sol";
import {DeployFundMe} from "script/fund-me/DeployFundMe.s.sol";

// forge test --match-contract FundMeTest -vvv
contract FundMeTest is Test {
    FundMe fundMe;

    address USER = makeAddr("user");
    uint constant SEND_VALUE = 0.1 ether;
    uint constant STARTING_BALANCE = 10 ether;
    uint constant GAS_PRICE = 1;

    function setUp() external {
        // fundMe = new FundMe(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        DeployFundMe deployFundMe = new DeployFundMe();
        fundMe = deployFundMe.run();
        vm.deal(USER, STARTING_BALANCE);
    }

    function testMinimumUsdIsFive() public view {
        assert(fundMe.MINIMUM_USD() == 5e18);
    }

    function testOwner() public view {
        // console.log(fundMe.i_owner());
        // console.log(msg.sender);
        // console.log(address(this));
        // for FundMe, FundMeTest is the msg.sender not us
        assert(fundMe.i_owner() == msg.sender);
    }

    // forge test --match-test testPriceFeedVersion -vvvv
    // It will throw error
    // as we don't have access to sepolia's deployed AggregatorV3Interface address
    // 0x694AA1769357215DE4FAC081bf1f309aDC325306::version() [staticcall]
    // forge test --match-test testPriceFeedVersion -vvv --rpc-url https://1rpc.io/sepolia
    function testPriceFeedVersion() public view {
        assert(fundMe.getVersion() == 4);
    }

    function testFundFailsWithoutEnoughETH() public {
        vm.expectRevert();
        fundMe.fund();
    }

    function testFundUpdatesFunderToAmountFunded() public {
        vm.prank(USER);
        fundMe.fund{value: SEND_VALUE}();

        uint256 amountFunded = fundMe.getFunderToAmountFunded(USER);
        assert(SEND_VALUE == amountFunded);
    }

    function testFundersArrayUpdates() public {
        vm.prank(USER);
        fundMe.fund{value: SEND_VALUE}();

        address funder = fundMe.getFunder(0);
        assert(funder == USER);
    }

    modifier funded() {
        vm.prank(USER);
        fundMe.fund{value: SEND_VALUE}();
        _;
    }

    function testOnlyOwnerCanWithdraw() public funded {
        vm.expectRevert();
        fundMe.withdraw();
    }

    function testWithdrawFromASingleFunder() public funded {
        // Arrange
        uint256 startingOwnerBalance = fundMe.getOwner().balance;
        uint256 startingFundMeBalance = address(fundMe).balance;

        // Act
        // gas operations
        vm.txGasPrice(GAS_PRICE);
        uint startingGas = gasleft();

        vm.prank(fundMe.getOwner());
        fundMe.withdraw();

        uint endingGas = gasleft();
        console.log("Gas used: ", startingGas - endingGas);

        // Assert
        uint endingOwnerBalance = fundMe.getOwner().balance;
        uint endingFundMeBalance = address(fundMe).balance;
        assert(endingFundMeBalance == 0);
        assert(
            startingOwnerBalance + startingFundMeBalance == endingOwnerBalance
        );
    }

    function testWithdrawCheaperFromASingleFunder() public funded {
        // Arrange
        uint startingOwnerBalance = fundMe.getOwner().balance;
        uint startingFundMeBalance = address(fundMe).balance;

        // Act
        vm.prank(fundMe.getOwner());
        fundMe.withdrawCheaper();

        // Assert
        uint256 endingOwnerBalance = fundMe.getOwner().balance;
        uint256 endingFundMeBalance = address(fundMe).balance;
        assert(endingFundMeBalance == 0);
        assert(startingOwnerBalance + startingFundMeBalance == endingOwnerBalance);
    }

    function testWithdrawFromAMultipleFunders() public funded {
        // Arrange
        uint256 numOfFunders = 10;
        for (uint256 i = 1; i <= numOfFunders; i++) {
            // hoax = deal + prank
            hoax(address(uint160(i)), STARTING_BALANCE);
            fundMe.fund{value: SEND_VALUE}();
        }

        uint256 startingOwnerBalance = fundMe.getOwner().balance;
        uint256 startingFundMeBalance = address(fundMe).balance;

        // Act
        vm.prank(fundMe.getOwner());
        fundMe.withdraw();

        // Assert
        uint256 endingOwnerBalance = fundMe.getOwner().balance;
        uint256 endingFundMeBalance = address(fundMe).balance;
        assert(endingFundMeBalance == 0);
        assert(startingOwnerBalance + startingFundMeBalance == endingOwnerBalance);
        assert(
            // funded modifier has USER as a funder
            (numOfFunders + 1) * SEND_VALUE == endingOwnerBalance - startingOwnerBalance
        );
    }
}
