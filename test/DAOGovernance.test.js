const { expect } = require("chai");
const { ethers } = require("hardhat");

/* ---------- HARDHAT-SAFE HELPERS ---------- */
async function mineBlocks(count) {
  for (let i = 0; i < count; i++) {
    await ethers.provider.send("evm_mine", []);
  }
}

async function increaseTime(seconds) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

describe("DAO Governance System", function () {
  let govToken, timelock, governor, treasury;
  let deployer, voter1, voter2;

  beforeEach(async function () {
    [deployer, voter1, voter2] = await ethers.getSigners();

    /* ---------- GOVToken ---------- */
    const GOVToken = await ethers.getContractFactory("GOVToken");
    govToken = await GOVToken.deploy(
      "Governance Token",
      "GOV",
      ethers.parseEther("10000")
    );
    await govToken.waitForDeployment();

    /* ---------- Timelock ---------- */
    const Timelock = await ethers.getContractFactory("DAOTimelock");
    timelock = await Timelock.deploy(
      60,
      [],
      [],
      deployer.address
    );
    await timelock.waitForDeployment();

    /* ---------- Governor ---------- */
    const Governor = await ethers.getContractFactory("DAOGovernor");
    governor = await Governor.deploy(
      await govToken.getAddress(),
      await timelock.getAddress()
    );
    await governor.waitForDeployment();

    /* ---------- Timelock Roles ---------- */
    await timelock.grantRole(
      await timelock.PROPOSER_ROLE(),
      await governor.getAddress()
    );

    await timelock.grantRole(
      await timelock.EXECUTOR_ROLE(),
      ethers.ZeroAddress
    );

    await timelock.revokeRole(
      await timelock.DEFAULT_ADMIN_ROLE(),
      deployer.address
    );

    /* ---------- Treasury ---------- */
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await Treasury.deploy(await timelock.getAddress());
    await treasury.waitForDeployment();

    // Fund treasury with ETH
await deployer.sendTransaction({
  to: await treasury.getAddress(),
  value: ethers.parseEther("5"),
});


    /* ---------- Token Distribution ---------- */
    await govToken.transfer(voter1.address, ethers.parseEther("1000"));
    await govToken.transfer(voter2.address, ethers.parseEther("1000"));

    await govToken.connect(voter1).delegate(voter1.address);
    await govToken.connect(voter2).delegate(voter2.address);

    await mineBlocks(12);
  });

  it("allows proposal creation, voting, queueing, and execution", async function () {
    const encodedCall = treasury.interface.encodeFunctionData(
      "withdrawFunds",
      [voter1.address, ethers.parseEther("1")]
    );

    /* ---------- Propose ---------- */
    const tx = await governor.connect(voter1).propose(
      [await treasury.getAddress()],
      [0],
      [encodedCall],
      "Withdraw 1 ETH from treasury"
    );

    const receipt = await tx.wait();
    const proposalId = receipt.logs[0].args.proposalId;

    /* ---------- Voting ---------- */
    await mineBlocks(await governor.votingDelay() + 1n);

    await governor.connect(voter1).castVote(proposalId, 1);
    await governor.connect(voter2).castVote(proposalId, 1);

    /* ---------- End Voting ---------- */
    const votingPeriod = await governor.votingPeriod();
    await mineBlocks(Number(votingPeriod + 1n));

    expect(await governor.state(proposalId)).to.equal(4); // Succeeded

    /* ---------- Queue ---------- */
    await governor.queue(
      [await treasury.getAddress()],
      [0],
      [encodedCall],
      ethers.id("Withdraw 1 ETH from treasury")
    );

    /* ---------- Timelock ---------- */
    await increaseTime(61);

    /* ---------- Execute ---------- */
    await governor.execute(
      [await treasury.getAddress()],
      [0],
      [encodedCall],
      ethers.id("Withdraw 1 ETH from treasury")
    );
  });
});
