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
    /// @dev Reverts if caller is not a participant
    error NotParticipant();
    /// @dev Reverts if participant has already submitted
    error AlreadySubmitted();
    /// @dev Reverts if not all participants have submitted
    error IncompleteSubmissions();
    /// @dev Reverts if comparison has already been done
    error ComparisonAlreadyDone();
    /// @dev Reverts if comparison has not been done
    error ComparisonNotDone();
    /// @dev Reverts if caller is not authorized to handle encrypted value
    error UnauthorizedValueHandle();
    /// @dev Reverts if zero address is provided
    error ZeroAddress();
    /// @dev Reverts if duplicate addresses are provided
    error DuplicateAddresses();
    /// @dev Reverts if invalid winner code is provided
    error InvalidWinnerCode();

    address public immutable alice;
    address public immutable bob;
    address public immutable eve;
    mapping(address => euint256) private wealth;
    mapping(address => bool) private hasSubmitted;
    string public winner;
    bool public comparisonDone;

    event WealthSubmitted(address indexed participant);
    event ComparisonCompleted(string winner);

    /// @notice Sets the three participants' addresses
    /// @param _alice Address of the first participant
    /// @param _bob Address of the second participant
    /// @param _eve Address of the third participant
    constructor(address _alice, address _bob, address _eve) Ownable(msg.sender) {
        if (_alice == address(0) || _bob == address(0) || _eve == address(0)) {
            revert ZeroAddress();
        }
        if (_alice == _bob || _alice == _eve || _bob == _eve) {
            revert DuplicateAddresses();
        }
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
        
        euint256 encryptedWealth = e.newEuint256(valueInput, msg.sender);
        e.allowThis(encryptedWealth);
        
        wealth[msg.sender] = encryptedWealth;
        hasSubmitted[msg.sender] = true;
        
        emit WealthSubmitted(msg.sender);
    }

    /// @inheritdoc IMillionairesDilemma
    function submitWealth(euint256 encryptedWealth) external override onlyParticipants nonReentrant {
        if (hasSubmitted[msg.sender]) {
            revert AlreadySubmitted();
        }
        
        if (!e.isAllowed(msg.sender, encryptedWealth)) {
            revert UnauthorizedValueHandle();
        }
        
        e.allowThis(encryptedWealth);
        
        wealth[msg.sender] = encryptedWealth;
        hasSubmitted[msg.sender] = true;
        
        emit WealthSubmitted(msg.sender);
    }

    /// @inheritdoc IMillionairesDilemma
    function compareWealth() external override nonReentrant {
        if (!hasSubmitted[alice] || !hasSubmitted[bob] || !hasSubmitted[eve]) {
            revert IncompleteSubmissions();
        }
        if (comparisonDone) {
            revert ComparisonAlreadyDone();
        }

        euint256 result = LibComparison.prepareWinnerDetermination(
            wealth[alice],
            wealth[bob],
            wealth[eve]
        );
        
        e.requestDecryption(result, this.processWinner.selector, "");
    }

    /// @notice Processes the decrypted winner code from Inco relay
    /// @param winnerCode Code indicating winner (2=Alice, 1=Bob, 0=Eve)
    function processWinner(uint256, uint256 winnerCode, bytes memory) external {
        require(msg.sender == address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd), "Unauthorized");
        if (comparisonDone) {
            revert ComparisonAlreadyDone();
        }
        if (winnerCode > 2) {
            revert InvalidWinnerCode();
        }
        
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

    /// @notice Resets the contract state for reuse
    /// @dev Only callable by the owner
    function reset() external onlyOwner {
        wealth[alice] = e.asEuint256(0);
        wealth[bob] = e.asEuint256(0);
        wealth[eve] = e.asEuint256(0);
        hasSubmitted[alice] = false;
        hasSubmitted[bob] = false;
        hasSubmitted[eve] = false;
        winner = "";
        comparisonDone = false;
    }
}