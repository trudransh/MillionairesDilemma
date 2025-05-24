// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

/// @title LibComparison
/// @dev Library for confidential wealth comparison using Inco Lightning's euint256
library LibComparison {
    /// @dev Finds the index of the participant with maximum wealth
    /// @param wealthValues Array of encrypted wealth values
    /// @return euint256 Encrypted index of the winner (0-based)
    function findWealthiestParticipant(
        euint256[] memory wealthValues
    ) internal returns (euint256) {
        require(wealthValues.length > 0, "Empty wealth array");
        
        // Start with first participant as max
        euint256 maxWealth = wealthValues[0];
        euint256 maxIndex = e.asEuint256(0);
        
        // Compare each participant
        for (uint256 i = 1; i < wealthValues.length; i++) {
            ebool isGreater = e.gt(wealthValues[i], maxWealth);
            e.allowThis(isGreater);
            
            // Update max if current is greater
            maxWealth = e.select(isGreater, wealthValues[i], maxWealth);
            maxIndex = e.select(isGreater, e.asEuint256(i), maxIndex);
        }
        
        return maxIndex;
    }
}