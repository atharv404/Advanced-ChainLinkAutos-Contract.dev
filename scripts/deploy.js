const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const pool = process.env.AAVE_POOL;
  const oracle = process.env.MANUAL_ORACLE;
  const collateral = process.env.AAVE_WETH;
  const debt = process.env.AAVE_DAI;

  if (!pool || !oracle || !collateral || !debt) {
    throw new Error("Set AAVE_POOL, MANUAL_ORACLE, AAVE_WETH, AAVE_DAI in .env");
  }

  const TestAaveLiquidation = await ethers.getContractFactory("TestAaveLiquidation");
  const test = await TestAaveLiquidation.deploy(pool, oracle, collateral, debt);
  await test.waitForDeployment();

  console.log("TestAaveLiquidation deployed at:", await test.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
