// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

/**
 * @title LibComparison
 * @dev Library for confidential wealth comparison using Inco Lightning's euint256 and ebool.
 */
library LibComparison {
    /**
     * @dev Prepares the comparison results for decryption
     * @return euint256 Encrypted result code (2=Alice, 1=Bob, 0=Eve)
     */
    function prepareWinnerDetermination(
        euint256 aliceWealth,
        euint256 bobWealth,
        euint256 eveWealth
    ) internal returns (euint256) {
        // Compare wealth using explicit e library functions
        ebool aliceGtBob = e.gt(aliceWealth, bobWealth);
        ebool aliceGtEve = e.gt(aliceWealth, eveWealth);
        ebool bobGtEve = e.gt(bobWealth, eveWealth);

        // Allow contract to use encrypted comparison results
        e.allowThis(aliceGtBob);
        e.allowThis(aliceGtEve);
        e.allowThis(bobGtEve);

        // Convert FHE comparison results to a FHE numeric value (0, 1, 2)
        // 2 = Alice wins, 1 = Bob wins, 0 = Eve wins
        euint256 result = e.asEuint256(0); // Start with 0 (Eve)
        
        // If Alice is richest, result = 2
        ebool aliceWins = e.and(aliceGtBob, aliceGtEve);
        e.allowThis(aliceWins);
        result = e.select(aliceWins, e.asEuint256(2), result);
        
        // If Bob is richest and Alice isn't, result = 1
        ebool bobWins = e.and(bobGtEve, e.not(aliceGtBob));
        e.allowThis(bobWins);
        result = e.select(bobWins, e.asEuint256(1), result);
        
        return result;
    }
}