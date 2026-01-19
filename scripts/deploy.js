const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  /* ---------- Deploy GOVToken ---------- */
  const GOVToken = await ethers.getContractFactory("GOVToken");
  const govToken = await GOVToken.deploy(
    "Governance Token",
    "GOV",
    ethers.parseEther("1000000")
  );
  await govToken.waitForDeployment();

  console.log("GOVToken deployed to:", await govToken.getAddress());

  /* ---------- Deploy Timelock ---------- */
  const minDelay = 60; // 1 minute (local/testing)

  const proposers = [];
  const executors = [];

  const Timelock = await ethers.getContractFactory("DAOTimelock");
  const timelock = await Timelock.deploy(
    minDelay,
    proposers,
    executors,
    deployer.address
  );
  await timelock.waitForDeployment();

  console.log("Timelock deployed to:", await timelock.getAddress());

  /* ---------- Deploy Governor ---------- */
  const Governor = await ethers.getContractFactory("DAOGovernor");
  const governor = await Governor.deploy(
    "DAO Governor",
    await govToken.getAddress(),
    await timelock.getAddress()
  );
  await governor.waitForDeployment();

  console.log("Governor deployed to:", await governor.getAddress());

  /* ---------- Configure Roles ---------- */
  const proposerRole = await timelock.PROPOSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();
  const adminRole = await timelock.TIMELOCK_ADMIN_ROLE();

  await timelock.grantRole(proposerRole, await governor.getAddress());
  await timelock.grantRole(executorRole, ethers.ZeroAddress);
  await timelock.revokeRole(adminRole, deployer.address);

  console.log("Timelock roles configured");

  /* ---------- Deploy Treasury ---------- */
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(await timelock.getAddress());
  await treasury.waitForDeployment();

  console.log("Treasury deployed to:", await treasury.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
