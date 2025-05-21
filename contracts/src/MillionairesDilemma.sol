// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@inco/lightning/src/Lib.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LibComparison.sol";
import "./interface/IMillionairesDilemma.sol";

/// @title MillionairesDilemma
/// @author Your Name
/// @notice Confidential smart contract for comparing wealth of three participants using Inco Lightning
/// @dev Ensures only the richest participant's identity is revealed, following Inco best practices
contract MillionairesDilemma is IMillionairesDilemma, Ownable, ReentrancyGuard {
    // Custom errors
    error NotParticipant();
    error AlreadySubmitted();
    error IncompleteSubmissions();
    error ComparisonAlreadyDone();
    error ComparisonNotDone();
    error UnauthorizedValueHandle();

    // State variables
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

    /// @inheritdoc IMillionairesDilemma
    function submitWealth(bytes memory valueInput) external override onlyParticipants nonReentrant {
        if (hasSubmitted[msg.sender]) {
            revert AlreadySubmitted();
        }
        
        // Create new encrypted value from input with caller as allowed party
        euint256 encryptedWealth = valueInput.newEuint256(msg.sender);
        
        // Allow contract access to this value
        encryptedWealth.allowThis();
        
        // Store and mark as submitted
        wealth[msg.sender] = encryptedWealth;
        hasSubmitted[msg.sender] = true;
        
        emit WealthSubmitted(msg.sender);
    }

    /// @inheritdoc IMillionairesDilemma
    function submitWealth(euint256 encryptedWealth) external override onlyParticipants nonReentrant {
        if (hasSubmitted[msg.sender]) {
            revert AlreadySubmitted();
        }
        
        // Check if caller has access to the encrypted value
        if (!msg.sender.isAllowed(encryptedWealth)) {
            revert UnauthorizedValueHandle();
        }
        
        // Allow contract access to this value
        encryptedWealth.allowThis();
        
        // Store and mark as submitted
        wealth[msg.sender] = encryptedWealth;
        hasSubmitted[msg.sender] = true;
        
        emit WealthSubmitted(msg.sender);
    }

    /// @inheritdoc IMillionairesDilemma
    function compareWealth() external override nonReentrant {
        // Ensure all participants have submitted their wealth
        if (!hasSubmitted[alice] || !hasSubmitted[bob] || !hasSubmitted[eve]) {
            revert IncompleteSubmissions();
        }
        
        // Prevent multiple comparisons
        if (comparisonDone) {
            revert ComparisonAlreadyDone();
        }

        // Use the comparison library to determine the winner
        winner = LibComparison.determineWinner(
            wealth[alice],
            wealth[bob],
            wealth[eve],
            alice,
            bob,
            eve
        );
        
        comparisonDone = true;
        emit ComparisonCompleted(winner);
    }

    /// @inheritdoc IMillionairesDilemma
    function getWinner() external view override returns (string memory) {
        if (!comparisonDone) {
            revert ComparisonNotDone();
        }
        return winner;
    }

    /// @inheritdoc IMillionairesDilemma
    function hasParticipantSubmitted(address participant) external view override returns (bool) {
        return hasSubmitted[participant];
    }
} 