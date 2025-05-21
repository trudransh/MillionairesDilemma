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
        ebool aliceGtBob = e.gt(aliceWealth, bobWealth);
        ebool aliceGtEve = e.gt(aliceWealth, eveWealth);
        ebool bobGtEve = e.gt(bobWealth, eveWealth);

        e.allowThis(aliceGtBob);
        e.allowThis(aliceGtEve);
        e.allowThis(bobGtEve);

        euint256 result = e.asEuint256(0); 
        
        ebool aliceWins = e.and(aliceGtBob, aliceGtEve);
        e.allowThis(aliceWins);
        result = e.select(aliceWins, e.asEuint256(2), result);
        
        ebool bobWins = e.and(bobGtEve, e.not(aliceGtBob));
        e.allowThis(bobWins);
        result = e.select(bobWins, e.asEuint256(1), result);
        
        return result;
    }
}