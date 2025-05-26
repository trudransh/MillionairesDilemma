// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MillionairesDilemmaFactory} from "../src/MillionairesDilemmaFactory.sol";
import {console} from "forge-std/console.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the factory contract
        MillionairesDilemmaFactory factory = new MillionairesDilemmaFactory();
        
        // Log the deployed addresses
        console.log("Factory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
} 