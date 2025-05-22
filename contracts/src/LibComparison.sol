// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
/* solhint-enable import-path-check */
import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";
/* solhint-enable import-path-check */
/// @title LibComparison
/// @dev Library for confidential wealth comparison using Inco Lightning's euint256 and ebool
library LibComparison {
    /// @dev Prepares the comparison results for decryption
    /// @notice Tie-breaking: Alice wins if wealth equals Bob or Eve, Bob wins if wealth equals Eve
    /// @param aliceWealth Encrypted wealth of Alice
    /// @param bobWealth Encrypted wealth of Bob
    /// @param eveWealth Encrypted wealth of Eve
    /// @return euint256 Encrypted result code (2=Alice, 1=Bob, 0=Eve)
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

        ebool aliceWins = e.and(aliceGtBob, aliceGtEve);
        ebool bobWins = e.and(bobGtEve, e.not(aliceGtBob));
        e.allowThis(aliceWins);
        e.allowThis(bobWins);

        return e.select(aliceWins, e.asEuint256(2), e.select(bobWins, e.asEuint256(1), e.asEuint256(0)));
    }
}