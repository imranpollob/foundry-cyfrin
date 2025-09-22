// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// forge install smartcontractkit/chainlink-brownie-contracts  --no-commit

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// check the function visibility is internal
library PriceConversion {
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        (, int256 price,,,) = priceFeed.latestRoundData();
        return uint256(price) * 1e10;
        // chainlink return result having 8 decimals.
        // So multiplying with 10 to get a 18 decimal number.
        // 3233_044,701,920,000,000,000
    }

    function getCoversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // here ethAmount is e18. So multiplying it with e18 price will create a e36 number.
        // finally dividing it by e18 will give us a e18 number.
        uint256 ethPrice = getPrice(priceFeed);
        return (ethPrice * ethAmount) / 1e18;
    }
}
