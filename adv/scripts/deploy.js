const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const AutomationCounter = await ethers.getContractFactory("AutomationCounter");
  const counter = await AutomationCounter.deploy(10); // every 10 blocks
  await counter.waitForDeployment();
  console.log("AutomationCounter:", await counter.getAddress());

  // For local tests we pass dummy addresses; on staging, replace with real Aave pool + WETH
  const AaveBasicTest = await ethers.getContractFactory("AaveBasicTest");
  const POOL = process.env.AAVE_POOL || "0x0000000000000000000000000000000000000001";
  const WETH = process.env.AAVE_WETH || "0x0000000000000000000000000000000000000002";

  const aave = await AaveBasicTest.deploy(POOL, WETH);
  await aave.waitForDeployment();
  console.log("AaveBasicTest:", await aave.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
