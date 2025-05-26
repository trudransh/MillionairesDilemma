// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MillionairesDilemma} from "./MillionairesDilemma.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MillionairesDilemmaFactory
/// @notice Factory for creating MillionairesDilemma competition instances with a simple new instance approach
contract MillionairesDilemmaFactory is Ownable {
    // Track all deployed games
    address[] public deployedGames;
    mapping(address => bool) public isGameCreatedByFactory;
    
    event GameCreated(
        address indexed gameAddress, 
        address indexed creator, 
        string gameName,
        uint256 participantCount
    );
    
    constructor() Ownable(msg.sender) {
    }
    
    /// @notice Creates a new wealth comparison game by deploying a new instance
    /// @param gameName Name of this competition game
    /// @param participantAddresses Addresses of all participants
    /// @param participantNames Names of all participants
    /// @return gameAddress Address of the new game contract
    function createGame(
        string calldata gameName,
        address[] calldata participantAddresses,
        string[] calldata participantNames
    ) external returns (address gameAddress) {
        require(participantAddresses.length == participantNames.length, "Arrays length mismatch");
        require(participantAddresses.length >= 2, "Need at least 2 participants");
        
        // Create a new instance of MillionairesDilemma
        MillionairesDilemma game = new MillionairesDilemma();
        gameAddress = address(game);
        
        // Initialize the game
        game.initialize(msg.sender);
        
        // Register participants 
        for (uint256 i = 0; i < participantAddresses.length; i++) {
            game.registerParticipant(participantAddresses[i], participantNames[i]);
        }
        
        // Track the deployed game
        deployedGames.push(gameAddress);
        isGameCreatedByFactory[gameAddress] = true;
        
        emit GameCreated(gameAddress, msg.sender, gameName, participantAddresses.length);
        
        return gameAddress;
    }
    
    /// @notice Gets the count of games created by this factory
    /// @return Count of deployed games
    function getDeployedGamesCount() external view returns (uint256) {
        return deployedGames.length;
    }
    
    /// @notice Gets game address at a specific index
    /// @param index Index in the deployedGames array
    /// @return Game address
    function getGameAddress(uint256 index) external view returns (address) {
        require(index < deployedGames.length, "Index out of bounds");
        return deployedGames[index];
    }
}