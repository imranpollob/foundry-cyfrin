// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// import {Test} from "forge-std/Test.sol";
// import {console} from "forge-std/Script.sol";
// import {FundMe, NotOwner} from "../../src/fund-me/FundMe.sol";

// contract FundMeTest is Test {
//     FundMe fundMe;
//     address public constant USER = address(1);
//     uint public constant STARTING_BALANCE = 100 ether;
//     uint public constant SENT_AMOUNT = 10 ether;
//     address public owner;

//     function setUp() public {
//         fundMe = new FundMe();
//         owner = fundMe.owner();
//         vm.deal(USER, STARTING_BALANCE);
//     }

//     function testFundFailsWithoutEnoughEth() public {
//         vm.expectRevert();
//         fundMe.fund();
//     }

//     function testFund() public {
//         vm.prank(USER); // Sets msg.sender to the specified address for the next call ONLY
//         fundMe.fund{value: SENT_AMOUNT}();

//         assert(fundMe.addressToAmountFunded(USER) == SENT_AMOUNT);
//         assert(fundMe.funders(0) == USER);
//     }

//     function testWithdrawFailsWithoutOwner() public {
//         vm.startPrank(USER);
//         fundMe.fund{value: SENT_AMOUNT}();
//         vm.expectRevert(NotOwner.selector);
//         fundMe.withdraw();
//     }

//     function testWithdrawWithOwner() public {
//         vm.startPrank(USER);
//         fundMe.fund{value: SENT_AMOUNT}();
//         vm.stopPrank();

//         uint prevContractBalance = address(fundMe).balance;
//         uint prevOwnerBalance = address(this).balance;

//         console.log(prevContractBalance, prevOwnerBalance);

//         fundMe.withdraw();

//         assert(
//             prevContractBalance + prevOwnerBalance ==
//                 address(fundMe).balance + address(this).balance
//         );

//         console.log(address(fundMe).balance, address(this).balance);
//     }

//     receive() external payable {}
// }
