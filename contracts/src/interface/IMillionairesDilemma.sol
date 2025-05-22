// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
/* solhint-enable import-path-check */
import {euint256} from "@inco/lightning/src/Lib.sol";
/* solhint-enable import-path-check */
/// @title MillionairesDilemma Interface
/// @notice Interface for the MillionairesDilemma confidential wealth comparison contract
interface IMillionairesDilemma {
    /// @notice Submits encrypted wealth as bytes
    /// @param valueInput Ciphertext of wealth
    function submitWealth(bytes memory valueInput) external;

    /// @notice Submits encrypted wealth as euint256
    /// @param encryptedWealth Encrypted wealth value
    function submitWealth(euint256 encryptedWealth) external;

    /// @notice Compares wealth of all participants and determines the winner
    function compareWealth() external;

    /// @notice Retrieves the winner's identity
    /// @return Winner's name (Alice, Bob, or Eve)
    function getWinner() external view returns (string memory);

    /// @notice Checks if a participant has submitted their wealth
    /// @param participant Address to check
    /// @return True if participant has submitted, false otherwise
    function hasParticipantSubmitted(address participant) external view returns (bool);
}