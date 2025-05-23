// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {euint256} from "@inco/lightning/src/Lib.sol";

/// @title MillionairesDilemma Interface
/// @notice Interface for the MillionairesDilemma confidential wealth comparison contract
interface IMillionairesDilemma {
    /// @notice Event emitted when a new participant is registered
    event ParticipantRegistered(address indexed participantAddress, string name);
    
    /// @notice Event emitted when a participant submits their wealth
    event WealthSubmitted(address indexed participantAddress);
    
    /// @notice Event emitted when comparison starts
    event ComparisonStarted();
    
    /// @notice Event emitted when winner is determined
    event WinnerAnnounced(address indexed winnerAddress, string winnerName);

    /// @notice Event emitted when game is reset
    event GameReset(uint256 timestamp);

    /// @notice Initializes a new instance with owner
    function initialize(address owner) external;

    /// @notice Registers a new participant
    /// @param participant Address of the participant
    /// @param name Name of the participant
    function registerParticipant(address participant, string memory name) external;

    /// @notice Submits encrypted wealth as bytes
    /// @param valueInput Ciphertext of wealth
    function submitWealth(bytes memory valueInput) external;

    /// @notice Submits encrypted wealth as euint256
    /// @param encryptedWealth Encrypted wealth value
    function submitWealth(euint256 encryptedWealth) external;

    /// @notice Compares wealth of all participants and determines the winner
    function compareWealth() external;

    /// @notice Retrieves the winner's identity
    /// @return Winner's name
    function getWinner() external view returns (string memory);

    /// @notice Checks if a participant has submitted their wealth
    /// @param participant Address to check
    /// @return True if participant has submitted, false otherwise
    function hasParticipantSubmitted(address participant) external view returns (bool);
}