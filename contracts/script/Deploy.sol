// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MillionairesDilemma} from "../src/MillionairesDilemma.sol";
import {MillionairesDilemmaFactory} from "../src/MillionairesDilemmaFactory.sol";
import {console} from "forge-std/console.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the implementation contract
        MillionairesDilemma implementation = new MillionairesDilemma();
        
        // Deploy the factory contract with the implementation address
        MillionairesDilemmaFactory factory = new MillionairesDilemmaFactory(address(implementation));
        
        // Log the deployed addresses
        console.log("Implementation deployed at:", address(implementation));
        console.log("Factory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
} 