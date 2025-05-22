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

## Project Structure

The project is organized into the following main directories:

- `contracts/`: Contains the Solidity smart contracts and related tests.
- `backend/`: Contains the backend code, including end-to-end tests and configuration files.
- `docs/`: Contains documentation related to the Inco Lightning protocol and project setup.

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

To run a local test network, use Docker:

```bash
docker compose up -d
```
This will start a local Ethereum network with the following accounts pre-funded with test Ether:


This command starts the network, allowing you to deploy and test your dapp in a simulated environment.

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

## Running Tests

To run the test suite, navigate to the `contracts` directory and execute:

```bash
forge test
```

This will run all the tests in the `contracts/src/test` directory.


## Documentation

Further documentation is available in the `docs/` directory, including:

- [Inco Lightning SDK](docs/inco-lightning.md)

This documentation provides detailed information on the Inco Lightning protocol and how to interact with it using the provided SDK.

## Conclusion

The Millionaires Dilemma project is a robust implementation of confidential smart contracts using the Inco Lightning protocol. It provides a secure and efficient way to compare wealth without revealing sensitive information.