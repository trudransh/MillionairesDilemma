// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LibComparison.sol";
import "./interface/IMillionairesDilemma.sol";

/// @title MillionairesDilemma
/// @author Rudransh Singh Tomar
/// @notice Confidential smart contract for comparing wealth of three participants using Inco Lightning
/// @dev Ensures only the richest participant's identity is revealed, following Inco best practices
contract MillionairesDilemma is IMillionairesDilemma, Ownable, ReentrancyGuard {

    error NotParticipant();
    error AlreadySubmitted();
    error IncompleteSubmissions();
    error ComparisonAlreadyDone();  
    error ComparisonNotDone();
    error UnauthorizedValueHandle();

    address public immutable alice;
    address public immutable bob;
    address public immutable eve;
    mapping(address => euint256) private wealth;
    mapping(address => bool) private hasSubmitted;
    string public winner;
    bool public comparisonDone;

    // Events
    event WealthSubmitted(address indexed participant);
    event ComparisonCompleted(string winner);

    /// @notice Sets the three participants' addresses
    /// @param _alice Address of the first participant
    /// @param _bob Address of the second participant
    /// @param _eve Address of the third participant
    constructor(address _alice, address _bob, address _eve) Ownable(msg.sender) {
        alice = _alice;
        bob = _bob;
        eve = _eve;
    }

    /// @notice Ensures only the three participants can call certain functions
    modifier onlyParticipants() {
        if (msg.sender != alice && msg.sender != bob && msg.sender != eve) {
            revert NotParticipant();
        }
        _;
    }

    function submitWealth(bytes memory valueInput) external override onlyParticipants nonReentrant {
        if (hasSubmitted[msg.sender]) {
            revert AlreadySubmitted();
        }
        
        // The correct way to create an encrypted value from bytes
        euint256 encryptedWealth = e.newEuint256(valueInput, msg.sender);
        e.allowThis(encryptedWealth);
        
        wealth[msg.sender] = encryptedWealth;
        hasSubmitted[msg.sender] = true;
        
        emit WealthSubmitted(msg.sender);
    }

    function submitWealth(euint256 encryptedWealth) external override onlyParticipants nonReentrant {
        if (hasSubmitted[msg.sender]) {
            revert AlreadySubmitted();
        }
        
        // Check if caller has access to the encrypted value
        // The correct way to check permission is e.isAllowed(user, value)
        if (!e.isAllowed(msg.sender, encryptedWealth)) {
            revert UnauthorizedValueHandle();
        }
        
        // The correct way to allow access
        e.allowThis(encryptedWealth);
        
        wealth[msg.sender] = encryptedWealth;
        hasSubmitted[msg.sender] = true;
        
        emit WealthSubmitted(msg.sender);
    }

    function compareWealth() external override nonReentrant {
        if (!hasSubmitted[alice] || !hasSubmitted[bob] || !hasSubmitted[eve]) {
            revert IncompleteSubmissions();
        }

        if (comparisonDone) {
            revert ComparisonAlreadyDone();
        }

        // Get encrypted comparison result
        euint256 result = LibComparison.prepareWinnerDetermination(
            wealth[alice],
            wealth[bob],
            wealth[eve]
        );
        
        // Request decryption with callback
        e.requestDecryption(result, this.processWinner.selector, "");
    }

    function processWinner(
        uint256,
        uint256 winnerCode,
        bytes memory
    ) external {
        // Only Inco's contract should call this
        require(msg.sender == address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd), "Unauthorized");
        
        if (winnerCode == 2) {
            winner = "Alice";
        } else if (winnerCode == 1) {
            winner = "Bob";
        } else {
            winner = "Eve";
        }
        
        comparisonDone = true;
        emit ComparisonCompleted(winner);
    }

    function getWinner() external view override returns (string memory) {
        if (!comparisonDone) {
            revert ComparisonNotDone();
        }
        return winner;
    }

    /// @notice Check if a participant has submitted their wealth
    function hasParticipantSubmitted(address participant) external view override returns (bool) {
        return hasSubmitted[participant];
    }
} 