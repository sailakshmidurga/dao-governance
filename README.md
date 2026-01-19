# 🏛️ DAO Governance System

A complete **DAO Governance system** implemented using **OpenZeppelin Governor**, **TimelockController**, and **ERC20Votes**, with full **Hardhat test coverage** and **Dockerized setup** for one-command execution.

---

## 📌 Features

* ERC20 governance token with vote delegation
* On-chain proposal creation and voting
* Quorum-based decision making
* Timelock-controlled execution
* Treasury controlled only via DAO proposals
* Fully automated Hardhat test suite
* Docker & Docker Compose support

---

## 🏗️ Architecture Overview

### Core Contracts

| Contract          | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `GOVToken.sol`    | ERC20 governance token with voting power        |
| `DAOGovernor.sol` | Handles proposals, voting, and execution        |
| `DAOTimelock.sol` | Enforces execution delay for approved proposals |
| `Treasury.sol`    | Holds funds and allows withdrawals only via DAO |

### Governance Flow

1. Token holders delegate voting power
2. A proposal is created
3. Voting occurs during the voting period
4. Proposal is queued in the timelock
5. After delay, proposal is executed

---

## 🧪 Test Coverage

The system includes a full integration test that verifies:

* Proposal creation
* Voting by multiple voters
* Proposal state transitions
* Timelock queueing
* Execution of treasury withdrawal

✔️ All tests pass successfully.

---

## ⚙️ Local Setup (Without Docker)

### Prerequisites

* Node.js ≥ 18
* npm
* Git

### Install Dependencies

```bash
npm install
```

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

---

## 🐳 Docker Setup (Recommended)

This project supports **one-command execution using Docker**, ensuring environment consistency and zero local setup issues.

### Prerequisites

* Docker
* Docker Compose (v2+)

### Build and Run

```bash
docker compose up --build
```

This command will:

* Build the Docker image
* Install dependencies
* Compile contracts
* Run the complete Hardhat test suite automatically

---

## 📂 Project Structure

```text
dao-governance/
├── contracts/
│   ├── GOVToken.sol
│   ├── DAOGovernor.sol
│   ├── DAOTimelock.sol
│   └── Treasury.sol
│
├── test/
│   └── DAOGovernance.test.js
│
├── Dockerfile
├── docker-compose.yml
├── hardhat.config.js
├── package.json
└── README.md
```

---

## 🔐 Security Considerations

* Treasury can only be accessed via DAO proposals
* Timelock enforces execution delay
* No admin backdoors after initialization
* Uses audited OpenZeppelin governance contracts

---

## 📜 Technologies Used

* Solidity ^0.8.24
* OpenZeppelin Contracts
* Hardhat
* Ethers.js
* Docker & Docker Compose

---

## 🧠 Conclusion

This project demonstrates a **production-grade DAO governance system** with secure execution, proper decentralization controls, and reproducible deployment using Docker.

---
