// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@inco/lightning/src/Lib.sol";

interface IMillionairesDilemma {
    function submitWealth(bytes memory valueInput) external;
    function submitWealth(euint256 encryptedWealth) external;
    function compareWealth() external;
    function getWinner() external view returns (string memory);
    function hasParticipantSubmitted(address participant) external view returns (bool);
}  