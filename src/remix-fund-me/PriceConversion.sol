// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// uncomment the following import for remix
// import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
// comment out the following import for remix. It's for chainlink brownie contracts
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// check the function visibility is internal
library PriceConversion {
    function getPrice() internal view returns (uint256) {
        // Sepolia ETH->USD
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (, int256 price,,,) = priceFeed.latestRoundData();
        return uint256(price) * 1e10; // chainlink return result having 8 decimals. So multiplying with 10 to get a 18 decimal number.
            // 3233_044,701,920,000,000,000
    }

    function getCoversionRate(uint256 ethAmount) internal view returns (uint256) {
        // here ethAmount is e18. So multiplying it with e18 price will create a e36 number.
        // finally dividing it by e18 will give us a e18 number.
        uint256 ethPrice = getPrice();
        return (ethPrice * ethAmount) / 1e18;
    }

    function getVersion() internal view returns (uint256) {
        return AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306).version();
    }
}
