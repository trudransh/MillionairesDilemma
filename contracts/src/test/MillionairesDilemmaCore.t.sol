// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MillionairesDilemma} from "../MillionairesDilemma.sol";
import {LibComparison} from "../lib/Comparison.sol";
/* solhint-disable import-path-check */
import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
import {GWEI} from "@inco/shared/src/TypeUtils.sol";
import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";
import {IMillionairesDilemma} from "../interface/IMillionairesDilemma.sol";
/* solhint-enable import-path-check */

/// @title MillionairesDilemma Core Unit Tests
/// @notice Comprehensive unit tests for the core contract functionality
contract MillionairesDilemmaCore is IncoTest {
    // Test variables - renamed to avoid conflict with Inco library
    address public deployer;
    address public testAlice = makeAddr("alice");
    address public testBob = makeAddr("bob");
    address public testCharlie = makeAddr("charlie");
    address public maliciousUser = makeAddr("malicious");
    address public incoRelay = address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd);
    
    // Contract instance
    MillionairesDilemma public game;

    function setUp() public override {
        super.setUp();
        
        // Get the default testing address from the IncoTest framework
        deployer = address(this); // This is the address IncoTest is using
        
        // Instead of making a new deployer address, use the default test address
        deployer = deployer; // Change this in all test files
        
        // Rest of setup remains the same
        vm.startPrank(deployer);
        game = new MillionairesDilemma();
        game.initialize(deployer);
        vm.stopPrank();
    }
    
    /// === INITIALIZATION AND OWNERSHIP TESTS ===
    
    function testInitialization() public {
        assertEq(game.owner(), deployer);
        assertEq(game.getParticipantCount(), 0);
        assertFalse(game.comparisonDone());
        assertEq(game.winnerAddress(), address(0));
        assertEq(game.winner(), "");
    }
    
    function testCannotReinitialize() public {
        vm.expectRevert();
        game.initialize(testAlice);
    }
    
    function testInitializeToZeroAddress() public {
        MillionairesDilemma newGame = new MillionairesDilemma();
        vm.expectRevert();
        newGame.initialize(address(0));
    }
    
    function testOwnershipTransfer() public {
        vm.prank(deployer);
        game.transferOwnership(testAlice);
        assertEq(game.owner(), testAlice);
        
        // Alice can now register participants
        vm.prank(testAlice);
        game.registerParticipant(testBob, "Bob");
        
        // Original owner can't register anymore
        vm.prank(deployer);
        vm.expectRevert();
        game.registerParticipant(testCharlie, "Charlie");
    }
    
    /// === PARTICIPANT REGISTRATION TESTS ===
    
    function testRegisterParticipants() public {
        vm.startPrank(deployer);
        
        // Use the interface to access the event
        vm.expectEmit(true, false, false, true);
        emit IMillionairesDilemma.ParticipantRegistered(testAlice, "Alice");
        game.registerParticipant(testAlice, "Alice");
        
        // Register bob and charlie
        game.registerParticipant(testBob, "Bob");
        game.registerParticipant(testCharlie, "Charlie");
        
        vm.stopPrank();
        
        // Verify registration
        assertEq(game.getParticipantCount(), 3);
        assertTrue(game.isParticipant(testAlice));
        assertTrue(game.isParticipant(testBob));
        assertTrue(game.isParticipant(testCharlie));
        assertFalse(game.isParticipant(maliciousUser));
        
        // Verify names
        assertEq(game.getParticipantName(testAlice), "Alice");
        assertEq(game.getParticipantName(testBob), "Bob");
        assertEq(game.getParticipantName(testCharlie), "Charlie");
    }
    
    function testRegisterZeroAddress() public {
        vm.prank(deployer);
        vm.expectRevert(MillionairesDilemma.ZeroAddress.selector);
        game.registerParticipant(address(0), "Zero");
    }
    
    function testRegisterDuplicateAddress() public {
        vm.startPrank(deployer);
        game.registerParticipant(testAlice, "Alice");
        
        vm.expectRevert(MillionairesDilemma.DuplicateAddresses.selector);
        game.registerParticipant(testAlice, "Alice_Again");
        vm.stopPrank();
    }
    
    function testRegisterEmptyName() public {
        // This should work - empty name is allowed (not ideal but not forbidden)
        vm.prank(deployer);
        game.registerParticipant(testAlice, "");
        
        assertEq(game.getParticipantName(testAlice), "");
    }
    
    /// === ACCESS CONTROL TESTS ===
    
    function testNonOwnerCannotRegisterParticipants() public {
        vm.prank(testAlice);
        vm.expectRevert();
        game.registerParticipant(testBob, "Bob");
    }
    
    function testNonParticipantCannotSubmitWealth() public {
        vm.prank(maliciousUser);
        vm.expectRevert(MillionairesDilemma.NotParticipant.selector);
        game.submitWealth(fakePrepareEuint256Ciphertext(100));
    }
    
    function testNonParticipantCannotGetParticipantName() public {
        vm.prank(deployer);
        game.registerParticipant(testAlice, "Alice");
        
        vm.prank(deployer);
        vm.expectRevert(MillionairesDilemma.NotParticipant.selector);
        game.getParticipantName(maliciousUser);
    }
    
    function testNonOwnerCannotReset() public {
        vm.prank(testAlice);
        vm.expectRevert();
        game.reset();
    }
    
    /// === WEALTH SUBMISSION TESTS ===
    
    function testSubmitWealthWithBytes() public {
        // Register participants
        vm.startPrank(deployer);
        game.registerParticipant(testAlice, "Alice");
        game.registerParticipant(testBob, "Bob");
        vm.stopPrank();
        
        // Alice submits wealth
        vm.prank(testAlice);
        
        game.submitWealth(fakePrepareEuint256Ciphertext(100));
        
        advanceBlock();
        
        assertTrue(game.hasParticipantSubmitted(testAlice));
        assertFalse(game.hasParticipantSubmitted(testBob));
    }
    
    function testSubmitUnauthorizedEuint256() public {
        // Register participants
        vm.startPrank(deployer);
        game.registerParticipant(testAlice, "Alice");
        vm.stopPrank();
        
        // Create euint256 and mock isAllowed check to return false
        euint256 wealth = e.asEuint256(500);
        vm.mockCall(
            address(e),
            abi.encodeWithSelector(bytes4(keccak256("isAllowed(address,euint256)")), testAlice, wealth),
            abi.encode(false)
        );
        
        // Alice submits wealth
        vm.prank(testAlice);
        vm.expectRevert(MillionairesDilemma.UnauthorizedValueHandle.selector);
        game.submitWealth(wealth);
    }
    
    function testDoubleSubmission() public {
        // Register and submit once
        vm.startPrank(deployer);
        game.registerParticipant(testAlice, "Alice");
        vm.stopPrank();
        
        vm.prank(testAlice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100));
        
        advanceBlock();
        
        // Try to submit again
        vm.prank(testAlice);
        vm.expectRevert(MillionairesDilemma.AlreadySubmitted.selector);
        game.submitWealth(fakePrepareEuint256Ciphertext(200));
    }
    
    
    
    /// === WEALTH COMPARISON TESTS ===
    
    function testCompareWealthIncompleteSubmissions() public {
        // Register participants
        vm.startPrank(deployer);
        game.registerParticipant(testAlice, "Alice");
        game.registerParticipant(testBob, "Bob");
        vm.stopPrank();
        
        // Only Alice submits
        vm.prank(testAlice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100));
        
        advanceBlock();
        
        // Try to compare
        vm.expectRevert(MillionairesDilemma.IncompleteSubmissions.selector);
        game.compareWealth();
    }
            
    /// === LIBRARY TESTS ===
    
    function testComparisonLogic() public {
        euint256[] memory values = new euint256[](3);
        values[0] = e.asEuint256(100);
        values[1] = e.asEuint256(300);
        values[2] = e.asEuint256(200);
        
        euint256 maxIndex = LibComparison.findWealthiestParticipant(values);
        processAllOperations();
        
        uint256 winnerIdx = getUint256Value(maxIndex);
        assertEq(winnerIdx, 1); // Index 1 has value 300
    }
    
    function testComparisonWithTies() public {
        euint256[] memory values = new euint256[](3);
        values[0] = e.asEuint256(300); // First occurrence should win in a tie
        values[1] = e.asEuint256(300);
        values[2] = e.asEuint256(200);
        
        euint256 maxIndex = LibComparison.findWealthiestParticipant(values);
        processAllOperations();
        
        uint256 winnerIdx = getUint256Value(maxIndex);
        assertEq(winnerIdx, 0); // First occurrence of max value
    }
    
    function testComparisonWithSingleValue() public {
        euint256[] memory values = new euint256[](1);
        values[0] = e.asEuint256(100);
        
        euint256 maxIndex = LibComparison.findWealthiestParticipant(values);
        processAllOperations();
        
        uint256 winnerIdx = getUint256Value(maxIndex);
        assertEq(winnerIdx, 0);
    }
    
    function testEmptyComparisonReverts() public {
        euint256[] memory values = new euint256[](0);
        vm.expectRevert("Empty wealth array");
        LibComparison.findWealthiestParticipant(values);
    }

    // Add this helper function to all test files
    function advanceBlock() internal {
        // Advance the block number to bypass anti-frontrunning protection
        vm.roll(block.number + 1);
    }
}