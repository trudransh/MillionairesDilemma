# Millionaires Dilemma

Millionaires Dilemma is a confidential smart contract project designed to compare the wealth of three participants using Inco Lightning. The contract ensures that only the identity of the richest participant is revealed, following best practices for confidentiality, security, and gas optimization.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Development Environment](#development-environment)
- [Running Tests](#running-tests)
- [Linting with Solhint](#linting-with-solhint)
- [CI/CD Pipeline](#cicd-pipeline)
- [Documentation](#documentation)

## Overview

The Millionaires Dilemma project leverages the Inco Lightning protocol to perform confidential computations on Ethereum. It uses encrypted values to ensure privacy and only reveals the necessary information after computations are complete.

## Project Directory Structure

The project is organized into two main components: smart contracts and frontend application.

### Smart Contracts (`/contracts`)

```
contracts/
├── script/                  # Deployment scripts
│   └── Deploy.sol           # Main deployment script
│
├── src/                     # Source contracts
│   ├── interface/           # Contract interfaces
│   │   └── IMillionairesDilemma.sol  # Main contract interface
│   │
│   ├── lib/                 # Contract libraries
│   │   └── Comparison.sol   # FHE comparison library
│   │
│   ├── test/                # Test files
│   │   └── MillionairesDilemmaCore.t.sol  # Core contract tests
│   │
│   ├── MillionairesDilemma.sol      # Main contract implementation
│   └── MillionairesDilemmaFactory.sol  # Factory contract for game creation
│
├── .solhint.json            # Solidity linter configuration
├── foundry.toml             # Foundry configuration
└── remappings.txt           # Import remappings for Solidity
```

#### Key Contract Files

- **MillionairesDilemma.sol**: The core contract that implements the confidential wealth comparison logic using FHE.
- **MillionairesDilemmaFactory.sol**: Factory contract that deploys new game instances using the minimal proxy pattern.
- **Comparison.sol**: Library containing the confidential comparison algorithm.
- **IMillionairesDilemma.sol**: Interface defining the contract's public functions and events.

### Frontend Application (`/frontend`)

```
frontend/
├── public/                  # Static assets
│
├── src/
│   ├── abi/                 # Contract ABIs
│   │   ├── millionairesDilemma.json
│   │   └── millionairesDilemmaFactory.json
│   │
│   ├── app/                 # Next.js app router pages
│   │   ├── games/           # Game-related pages
│   │   │   ├── [address]/   # Individual game page (dynamic route)
│   │   │   └── create/      # Game creation page
│   │   │
│   │   ├── layout.js        # Root layout component
│   │   └── page.js          # Home page
│   │
│   ├── components/          # Reusable UI components
│   │   ├── game/            # Game-specific components
│   │   ├── modals/          # Modal dialogs
│   │   ├── NavBar.jsx       # Navigation bar component
│   │   └── WalletButton.jsx # Wallet connection button
│   │
│   ├── provider/            # React context providers
│   │   ├── balance-provider.js  # Balance tracking provider
│   │   └── web3-provider.js     # Web3 connection provider
│   │
│   └── utils/               # Utility functions
│       ├── contract.js      # Contract interaction utilities
│       └── inco-lite.js     # Inco FHE integration utilities
│
├── .env.local               # Local environment variables (created during setup)
├── next.config.js           # Next.js configuration
├── package.json             # Frontend dependencies
└── tailwind.config.js       # Tailwind CSS configuration
```

#### Key Frontend Files

- **contract.js**: Contains contract addresses and ABI imports for interacting with the blockchain.
- **web3-provider.js**: Sets up the web3 connection and wallet interaction capabilities.
- **inco-lite.js**: Provides utilities for working with encrypted values using Inco's FHE technology.
- **[address]/page.js**: Dynamic page for viewing and interacting with a specific game instance.
- **create/page.js**: Page for creating new game instances with multiple participants.

### Root Directory

```
/
├── contracts/               # Smart contract code (described above)
├── frontend/                # Frontend application (described above)
├── .github/                 # GitHub configuration files
│   └── workflows/           # CI/CD workflow definitions
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
└── start-local.sh           # Local development setup script
```

## Quick Start

### Prerequisites

Ensure you have the following tools installed:

- [Docker](https://www.docker.com/)
- [Bun](https://bun.sh/)
- [Foundry](https://getfoundry.sh/)

### Install Dependencies

To install the dependencies, run:

```bash
bun install
```

### Local Test Network

1. Open a terminal window and start Anvil:
   ```bash
   anvil --chain-id 31337 --block-time 2
   ```

2. Keep this terminal window open. Anvil will display a list of test accounts with private keys. Note these for later use.

#### MetaMask Configuration

1. **Add Local Network to MetaMask**:
   - Open MetaMask and click on the network dropdown at the top
   - Select "Add network" → "Add a network manually"
   - Fill in the following details:
     - **Network Name**: Anvil Local
     - **New RPC URL**: http://localhost:8545
     - **Chain ID**: 31337
     - **Currency Symbol**: ETH
     - **Block Explorer URL**: (leave blank)
   - Click "Save"

2. **Import Test Accounts to MetaMask**:
   - In MetaMask, click on your account icon in the top-right corner
   - Select "Import Account"
   - Enter the private key of the first account displayed in your Anvil terminal
     (Example: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)
   - Click "Import"
   - Repeat to import additional accounts as needed (at least 2-3 accounts for testing)

#### Smart Contract Deployment

1. **Clone the Repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd MillionairesDilemma_contracts
   ```

2. **Install Dependencies**:
   ```bash
   cd contracts
   forge install
   ```

3. **Deploy the Contracts Manually**:
   - Open a new terminal window (keep Anvil running in the first one)
   - Navigate to the project directory's contracts folder
   - Set environment variables:
     ```bash
     export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
     export RPC_URL=http://localhost:8545
     ```
   - Deploy the contracts:
     ```bash
     forge script script/Deploy.sol:DeployScript --rpc-url $RPC_URL --broadcast --no-test
     ```
   - Look for the contract addresses in the output:
     ```
     Implementation deployed at: 0x...
     Factory deployed at: 0x...
     ```
   - Copy both addresses for the next step

4. **Set Environment Variables for Frontend**:
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Create `.env.local` manually:
     ```bash
     echo "NEXT_PUBLIC_MILLIONAIRES_DILEMMA_FACTORY_ADDRESS=0x..." > .env.local
     echo "NEXT_PUBLIC_CHAIN_ID=31337" >> .env.local
     ```
     (Replace `0x...` with the factory address from the deployment output)

#### Frontend Setup

1. **Install Frontend Dependencies**:
   ```bash
   cd frontend  # if not already in the frontend directory
   bun install  # or npm install
   ```

2. **Verify Contract Address Configuration**:
   - Open `src/utils/contract.js`
   - Ensure the fallback address matches your deployed factory address:
     ```javascript
     export const MILLIONAIRES_DILEMMA_FACTORY_ADDRESS =
       process.env.NEXT_PUBLIC_MILLIONAIRES_DILEMMA_FACTORY_ADDRESS || "0x...";
     ```
     (Replace `0x...` with your factory address)

3. **Start the Development Server**:
   ```bash
   bun dev  # or npm run dev
   ```

4. **Access the Application**:
   - Open your browser and navigate to http://localhost:3000

## Development Environment

### Running the Devcontainer

The project includes a devcontainer setup for a consistent development environment. To use it, ensure you have Docker and a compatible IDE (like VSCode) with the Remote - Containers extension.

1. Open the project in your IDE.
2. Reopen the project in the devcontainer when prompted.

### Linting with Solhint

The project uses `solhint` for linting Solidity code. To run the linter, execute:

```bash
solhint "contracts/**/*.sol"
```

### Running Tests

To run the tests, use Foundry's testing framework:

```bash
forge test
```

### CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The pipeline is defined in `.github/workflows/test.yml` and includes the following steps:

- **Checkout**: Clones the repository and its submodules.
- **Install Foundry**: Sets up the Foundry toolchain.
- **Setup Bun**: Installs Bun for package management.
- **Install Dependencies**: Installs project dependencies using Bun.
- **Run Linter**: Executes `solhint` to lint Solidity code.
- **Build Contracts**: Compiles the Solidity contracts using Foundry.
- **Run Tests**: Executes the test suite with verbose output.
- **Generate Gas Report**: Produces a gas usage report for the contracts.

## Test Suite
Below is a detailed list of tests that covers the core functionality of the Millionaires Dilemma contract.
### Core Contract Tests
- **Initialization**: Verifies proper contract initialization and ownership management
- **Participant Registration**: Tests participant registration with validation for:
  - Zero address prevention
  - Duplicate address prevention
  - Name handling
  - Access control (only owner can register)
- **Wealth Submission**: Tests both submission methods with proper encryption:
  - Submission via encrypted bytes
  - Submission via euint256
  - Prevention of duplicate submissions
  - Authorization checks
- **Comparison Process**: Validates the wealth comparison mechanism:
  - Proper handling of incomplete submissions
  - Event emission on comparison start
  - Correct winner identification

### Cryptographic Library Tests
- **Comparison Logic**: Validates the secure comparison algorithm works correctly
- **Tie Handling**: Ensures fair resolution when multiple participants have equal wealth
- **Edge Cases**: Tests single participant scenarios and empty array handling

### Security Tests
- **Access Control**: Verifies authorization for all restricted functions
- **Privacy Protection**: Ensures encrypted values remain confidential throughout the process
- **Anti-Frontrunning**: Tests protection against transaction ordering attacks

## Implementation Approach

### Contract Architecture

The Millionaire's Dilemma is implemented using a factory pattern with the following key components:

1. **MillionairesDilemma Contract**: The core contract that handles the encrypted wealth comparison logic using Inco's FHE capabilities.

2. **MillionairesDilemmaFactory Contract**: A factory contract that creates new game instances using the minimal proxy pattern (EIP-1167) for gas efficiency.

3. **LibComparison Library**: A specialized library that implements the secure comparison algorithm for encrypted values.

### Why This Approach?

We chose this architecture for several important reasons:

- **Isolation of Game State**: Each game has its own isolated contract instance, preventing data leakage between different games.
  
- **Gas Efficiency**: The minimal proxy pattern significantly reduces deployment costs by cloning a reference implementation rather than deploying full contract code for each game.
  
- **Modularity**: Separating the comparison logic into a library makes the code more maintainable and allows for future optimizations.

### Fully Homomorphic Encryption (FHE) Implementation

The core of this project leverages Inco Lightning's FHE capabilities to perform computations on encrypted data:

1. **Encrypted Wealth Submission**: Participants submit their wealth as encrypted values (`euint256`) that cannot be decrypted by any party, including the contract itself.

2. **Zero-Knowledge Comparison**: The contract performs wealth comparison operations on encrypted values without ever revealing the underlying amounts.

3. **Selective Result Revelation**: Only the identity of the wealthiest participant is revealed after computation, maintaining privacy for all participants.

### Key Security Features

Our implementation includes several important security measures:

- **Re-encryption**: We implement a secure re-encryption mechanism that isolates each participant's wealth value, preventing even the submitter from accessing it after submission.

- **Access Controls**: The contract carefully manages who can register participants and submit wealth values to prevent unauthorized access.

- **Confidentiality Guarantees**: The design ensures that only the minimal necessary information (winner identity) is revealed, without exposing any actual wealth values.

### Implementation Details

#### Participant Registration

Participants are registered with their Ethereum addresses and display names. The contract maintains a mapping of participant data including:
```solidity
struct Participant {
string name;
bool isRegistered;
bool hasSubmitted;
euint256 wealth;
}
```

#### Wealth Submission

The contract provides two methods for submitting encrypted wealth:

1. Raw encrypted bytes submission:
```solidity
function submitWealth(bytes memory valueInput) external
```

2. Direct euint256 submission (for frontend integration):
```solidity
function submitWealth(euint256 valueInput) external
```

Both methods secure the submitted value through re-encryption to ensure complete isolation.

#### Comparison Logic

The wealth comparison uses a secure algorithm that:
1. Collects all submitted encrypted wealth values
2. Compares them pairwise to find the maximum value
3. Returns the encrypted index of the winner
4. Triggers decryption of only the winner index

#### Game Flow

1. Owner creates a new game instance through the factory
2. Participants submit their encrypted wealth values
3. Once all participants submit, anyone can trigger the comparison
4. The contract processes the comparison and reveals only the winner's identity

This implementation provides a secure, gas-efficient, and fully confidential solution to the classic Millionaire's Dilemma problem using cutting-edge FHE technology on Ethereum.


## Running Tests

To run the test suite, navigate to the `contracts` directory and execute:

```bash
forge test -vv
```

This will run all the tests in the `contracts/src/test` directory.

## Documentation

Further documentation is available in the `docs/` directory, including:

- [Inco Lightning SDK](docs/inco-lightning.md)

This documentation provides detailed information on the Inco Lightning protocol and how to interact with it using the provided SDK.

## Conclusion

The Millionaires Dilemma project is a robust implementation of confidential smart contracts using the Inco Lightning protocol. It provides a secure and efficient way to compare wealth without revealing sensitive information.