// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

/**
 * @title LibComparison
 * @dev Library for confidential wealth comparison using Inco Lightning's euint256 and ebool.
 */
library LibComparison {

    /**
     * @dev Determines the richest participant with tie-breaking rule (Alice > Bob > Eve).
     * @return string Winner's name
     */
    function determineWinner(
        euint256 aliceWealth,
        euint256 bobWealth,
        euint256 eveWealth,
        address alice,
        address bob,
        address eve
    ) internal view returns (string memory) {
        ebool aliceGtBob = e.gt(aliceWealth,bobWealth);
        ebool aliceGtEve = aliceWealth > eveWealth;
        ebool bobGtEve = bobWealth > eveWealth;

        aliceGtBob.allowThis();
        aliceGtEve.allowThis();
        bobGtEve.allowThis();

        if (aliceGtBob && aliceGtEve) {
            return "Alice";
        } else if (bobGtEve && !aliceGtBob) {
            return "Bob";
        }
        return "Eve";
    }
}