// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MillionairesDilemma} from "../MillionairesDilemma.sol";
import {LibComparison} from "../LibComparison.sol";
import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
import {GWEI} from "@inco/shared/src/TypeUtils.sol";
import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract TestMillionairesDilemma is IncoTest {
    MillionairesDilemma game;
    address notParticipant = address(0x4);

    function setUp() public override {
        super.setUp();
        game = new MillionairesDilemma(alice, bob, eve);
    }

    function testParticipantRoles() public view {
        assertEq(game.alice(), alice);
        assertEq(game.bob(), bob);
        assertEq(game.eve(), eve);
    }

    function testInitialState() public view {
        assertFalse(game.hasParticipantSubmitted(alice));
        assertFalse(game.hasParticipantSubmitted(bob));
        assertFalse(game.hasParticipantSubmitted(eve));
        assertFalse(game.comparisonDone());
    }

    function testWealthSubmission() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        assertTrue(game.hasParticipantSubmitted(alice));
        assertFalse(game.hasParticipantSubmitted(bob));
        assertFalse(game.hasParticipantSubmitted(eve));
    }

    function testPreventDoubleSubmission() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        vm.prank(alice);
        vm.expectRevert(MillionairesDilemma.AlreadySubmitted.selector);
        game.submitWealth(fakePrepareEuint256Ciphertext(200 * GWEI));
    }

    function testNonParticipantCannotSubmit() public {
        vm.prank(notParticipant);
        vm.expectRevert(MillionairesDilemma.NotParticipant.selector);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
    }

    function testCannotCompareBeforeAllSubmissions() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        vm.expectRevert(MillionairesDilemma.IncompleteSubmissions.selector);
        game.compareWealth();
    }

    function testCompleteFlow_AliceWinner() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        vm.prank(bob);
        game.submitWealth(fakePrepareEuint256Ciphertext(50 * GWEI));
        vm.prank(eve);
        game.submitWealth(fakePrepareEuint256Ciphertext(75 * GWEI));
        processAllOperations();
        game.compareWealth();
        address incoRelay = address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd);
        vm.prank(incoRelay);
        game.processWinner(0, 2, "");
        assertEq(game.getWinner(), "Alice");
        assertTrue(game.comparisonDone());
    }

    function testCompleteFlow_BobWinner() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(50 * GWEI));
        vm.prank(bob);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        vm.prank(eve);
        game.submitWealth(fakePrepareEuint256Ciphertext(75 * GWEI));
        processAllOperations();
        game.compareWealth();
        address incoRelay = address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd);
        vm.prank(incoRelay);
        game.processWinner(0, 1, "");
        assertEq(game.getWinner(), "Bob");
    }

    function testCompleteFlow_EveWinner() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(75 * GWEI));
        vm.prank(bob);
        game.submitWealth(fakePrepareEuint256Ciphertext(50 * GWEI));
        vm.prank(eve);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        processAllOperations();
        game.compareWealth();
        address incoRelay = address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd);
        vm.prank(incoRelay);
        game.processWinner(0, 0, "");
        assertEq(game.getWinner(), "Eve");
    }

    function testCannotAccessEncryptedWealth() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        assertTrue(game.hasParticipantSubmitted(alice));
    }

    function testUnauthorizedCannotCallbackFunction() public {
        vm.prank(notParticipant);
        vm.expectRevert("Unauthorized");
        game.processWinner(0, 2, "");
    }

    function testCannotProcessWinnerTwice() public {
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
        vm.prank(bob);
        game.submitWealth(fakePrepareEuint256Ciphertext(50 * GWEI));
        vm.prank(eve);
        game.submitWealth(fakePrepareEuint256Ciphertext(75 * GWEI));
        processAllOperations();
        game.compareWealth();
        address incoRelay = address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd);
        vm.prank(incoRelay);
        game.processWinner(0, 2, "");
        vm.prank(incoRelay);
        vm.expectRevert(MillionairesDilemma.ComparisonAlreadyDone.selector);
        game.processWinner(0, 2, "");
    }

    function testCannotGetWinnerBeforeComparison() public {
        vm.expectRevert(MillionairesDilemma.ComparisonNotDone.selector);
        game.getWinner();
    }

    function testFuzz_WealthValues(uint256 aliceWealth, uint256 bobWealth, uint256 eveWealth) public {
        aliceWealth = bound(aliceWealth, 1, type(uint128).max);
        bobWealth = bound(bobWealth, 1, type(uint128).max);
        eveWealth = bound(eveWealth, 1, type(uint128).max);
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(aliceWealth));
        vm.prank(bob);
        game.submitWealth(fakePrepareEuint256Ciphertext(bobWealth));
        vm.prank(eve);
        game.submitWealth(fakePrepareEuint256Ciphertext(eveWealth));
        processAllOperations();
        game.compareWealth();
        uint256 winnerCode;
        if (aliceWealth > bobWealth && aliceWealth > eveWealth) {
            winnerCode = 2;
        } else if (bobWealth > eveWealth && bobWealth >= aliceWealth) {
            winnerCode = 1;
        } else {
            winnerCode = 0;
        }
        address incoRelay = address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd);
        vm.prank(incoRelay);
        game.processWinner(0, winnerCode, "");
        string memory expectedWinner;
        if (winnerCode == 2) expectedWinner = "Alice";
        else if (winnerCode == 1) expectedWinner = "Bob";
        else expectedWinner = "Eve";
        assertEq(game.getWinner(), expectedWinner);
    }

    function testTiedWealthValues() public {
        uint256 tiedValue = 100 * GWEI;
        vm.prank(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(tiedValue));
        vm.prank(bob);
        game.submitWealth(fakePrepareEuint256Ciphertext(tiedValue));
        vm.prank(eve);
        game.submitWealth(fakePrepareEuint256Ciphertext(50 * GWEI));
        processAllOperations();
        game.compareWealth();
        address incoRelay = address(0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd);
        vm.prank(incoRelay);
        game.processWinner(0, 2, "");
        assertEq(game.getWinner(), "Alice");
    }

    function testLibComparisonLogic() public {
        euint256 aliceWealth = e.asEuint256(100);
        euint256 bobWealth = e.asEuint256(50);
        euint256 eveWealth = e.asEuint256(75);
        processAllOperations();
        euint256 result = LibComparison.prepareWinnerDetermination(aliceWealth, bobWealth, eveWealth);
        processAllOperations();
        uint256 winnerCode = getUint256Value(result);
        assertEq(winnerCode, 2);
    }

    function testWealthSubmittedEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, false);
        emit MillionairesDilemma.WealthSubmitted(alice);
        game.submitWealth(fakePrepareEuint256Ciphertext(100 * GWEI));
    }


}