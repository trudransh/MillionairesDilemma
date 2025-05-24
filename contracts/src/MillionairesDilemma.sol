// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {euint256, e} from "@inco/lightning/src/Lib.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {LibComparison} from "./lib/Comparison.sol";
import {IMillionairesDilemma} from "./interface/IMillionairesDilemma.sol";

/// @title MillionairesDilemma
/// @author Rudransh Singh Tomar
/// @notice Confidential smart contract for comparing wealth of participants using Inco Lightning
/// @dev Ensures only the richest participant's identity is revealed, following Inco best practices
contract MillionairesDilemma is IMillionairesDilemma, OwnableUpgradeable, ReentrancyGuard {
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
    /// @dev Reverts if unauthorized relay is used
    error UnauthorizedRelay();
    /// @dev Reverts if no participants are registered
    error NoParticipantsRegistered();

    // Participant data structure
    struct Participant {
        string name;
        bool isRegistered;
        bool hasSubmitted;
        euint256 wealth;
    }

    // Anti-frontrunning protection
    uint256 private lastActionBlock;

    // Participant tracking
    address[] public participants;
    mapping(address => Participant) private participantData;
    
    // Game state
    address public winnerAddress;
    string public winner;
    bool public comparisonDone;
    
    // Address of the Inco relay
    address public constant INCO_RELAY = 0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd;

    /// @notice Initializes the contract
    /// @param initialOwner Address that will own this contract instance
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        participants = new address[](0);
        lastActionBlock = block.number;
    }

    /// @notice Ensures only registered participants can call certain functions
    modifier onlyParticipants() {
        if (!participantData[msg.sender].isRegistered) {
            revert NotParticipant();
        }
        _;
    }

    /// @inheritdoc IMillionairesDilemma
    function registerParticipant(address participant, string memory name) external override onlyOwner {
        if (participant == address(0)) {
            revert ZeroAddress();
        }
        if (participantData[participant].isRegistered) {
            revert DuplicateAddresses();
        }
        
        participantData[participant] = Participant({
            name: name,
            isRegistered: true,
            hasSubmitted: false,
            wealth: e.asEuint256(0)
        });
        
        participants.push(participant);
        
        emit ParticipantRegistered(participant, name);
    }

    /// @inheritdoc IMillionairesDilemma
    function submitWealth(bytes memory valueInput) external override onlyParticipants nonReentrant {
        // Anti-frontrunning check
        require(block.number > lastActionBlock, "Potential frontrunning detected");
        lastActionBlock = block.number;
        
        if (participantData[msg.sender].hasSubmitted) {
            revert AlreadySubmitted();
        }

        // Create encrypted value from input
        euint256 encryptedWealth = e.newEuint256(valueInput, msg.sender);
        
        // Process the submission with re-encryption for enhanced security
        _processWealthSubmission(msg.sender, encryptedWealth);
    }

    /// @inheritdoc IMillionairesDilemma
    function submitWealth(euint256 encryptedWealth) external override onlyParticipants nonReentrant {
        // Anti-frontrunning check
        require(block.number > lastActionBlock, "Potential frontrunning detected");
        lastActionBlock = block.number;
        
        if (participantData[msg.sender].hasSubmitted) {
            revert AlreadySubmitted();
        }

        if (!e.isAllowed(msg.sender, encryptedWealth)) {
            revert UnauthorizedValueHandle();
        }
        
        // Process the submission with re-encryption for enhanced security
        _processWealthSubmission(msg.sender, encryptedWealth);
    }
    
    /// @notice Internal function to securely process wealth submissions
    /// @param sender Address of the participant submitting wealth
    /// @param wealth Encrypted wealth value
    function _processWealthSubmission(address sender, euint256 wealth) internal {
        // Re-encrypt the value to isolate it completely (only this contract can access it)
        // This 0 addition forces a new ciphertext creation that's accessible only to the contract
        euint256 reencryptedWealth = e.add(wealth, e.asEuint256(0));
        
        // Ensure the contract has access to this value in the future
        e.allowThis(reencryptedWealth);
        
        // Store the re-encrypted value
        participantData[sender].wealth = reencryptedWealth;
        participantData[sender].hasSubmitted = true;
        
        emit WealthSubmitted(sender);
    }

    /// @inheritdoc IMillionairesDilemma
    function compareWealth() external override nonReentrant {
        if (participants.length == 0) {
            revert NoParticipantsRegistered();
        }
        
        // Verify all participants have submitted
        for (uint i = 0; i < participants.length; i++) {
            if (!participantData[participants[i]].hasSubmitted) {
                revert IncompleteSubmissions();
            }
        }
        
        if (comparisonDone) {
            revert ComparisonAlreadyDone();
        }

        // Create an array of wealth values for comparison
        euint256[] memory wealthValues = new euint256[](participants.length);
        for (uint i = 0; i < participants.length; i++) {
            wealthValues[i] = participantData[participants[i]].wealth;
        }
        
        // Find the wealthiest participant
        euint256 winnerIndex = LibComparison.findWealthiestParticipant(wealthValues);
        
        emit ComparisonStarted();
        
        // Request decryption of the winner index
        e.requestDecryption(winnerIndex, this.processWinner.selector, "");
    }

    /// @notice Processes the decrypted winner index from Inco relay
    /// @param winnerIndex Index of the winner in the participants array
    function processWinner(uint256, uint256 winnerIndex, bytes memory) external {
        if (msg.sender != INCO_RELAY) {
            revert UnauthorizedRelay();
        }
        if (comparisonDone) {
            revert ComparisonAlreadyDone();
        }
        if (winnerIndex >= participants.length) {
            revert InvalidWinnerCode();
        }

        // Set winner
        winnerAddress = participants[winnerIndex];
        winner = participantData[winnerAddress].name;
        comparisonDone = true;
        
        emit WinnerAnnounced(winnerAddress, winner);
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
        return participantData[participant].hasSubmitted;
    }

    /// @notice Checks if an address is a registered participant
    /// @param participant Address to check
    /// @return True if address is a registered participant
    function isParticipant(address participant) external view returns (bool) {
        return participantData[participant].isRegistered;
    }
    
    /// @notice Gets the name of a participant
    /// @param participant Address of the participant
    /// @return Name of the participant
    function getParticipantName(address participant) external view returns (string memory) {
        if (!participantData[participant].isRegistered) {
            revert NotParticipant();
        }
        return participantData[participant].name;
    }
    
    /// @notice Gets the total number of registered participants
    /// @return Number of participants
    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    /// @notice Resets the contract state for reuse
    /// @dev Only callable by the owner
    function reset() external onlyOwner {
        for (uint i = 0; i < participants.length; i++) {
            participantData[participants[i]].hasSubmitted = false;
            participantData[participants[i]].wealth = e.asEuint256(0);
        }
        winnerAddress = address(0);
        winner = "";
        comparisonDone = false;
        
        emit GameReset(block.timestamp);
    }
}