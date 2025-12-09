const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");
const { supplyAave, borrowAave, repayAave, getHealthFactor } = require("../helpers");

describe("AutomationCounter", function () {
  it("increments counter after enough blocks", async function () {
    const AutomationCounter = await ethers.getContractFactory("AutomationCounter");
    const counter = await AutomationCounter.deploy(3);
    await counter.waitForDeployment();

    expect(await counter.counter()).to.equal(0);

    await mine(2);
    let [needed] = await counter.checkUpkeep("0x");
    expect(needed).to.equal(false);

    await mine(2);
    [needed] = await counter.checkUpkeep("0x");
    expect(needed).to.equal(true);

    await counter.performUpkeep("0x");
    expect(await counter.counter()).to.equal(1);
  });
});

describe("AaveBasicTest (shape / calls only)", function () {
  it("exposes basic functions and HF view", async function () {
    // Deploy with dummy addresses; we won't call into real pool on local
    const AaveBasicTest = await ethers.getContractFactory("AaveBasicTest");
    const dummyPool = "0x00000000000000000000000000000000000000A1";
    const dummyWeth = "0x00000000000000000000000000000000000000B2";

    const aave = await AaveBasicTest.deploy(dummyPool, dummyWeth);
    await aave.waitForDeployment();

    expect(await aave.pool()).to.equal(dummyPool);
    expect(await aave.weth()).to.equal(dummyWeth);

    // Just confirm the methods exist and callable (will revert due to dummy pool)
    await expect(getHealthFactor(aave)).to.be.reverted;
  });
});
