import {LibComparison} from "../lib/Comparison.sol";
import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
import {GWEI} from "@inco/shared/src/TypeUtils.sol";
import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";
contract LibTest is IncoTest {
    using e for *;

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