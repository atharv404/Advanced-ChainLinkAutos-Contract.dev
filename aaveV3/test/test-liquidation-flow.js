const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestAaveLiquidation (shape & staging flow guide)", function () {
  it("wiring + HF read flow (local)", async function () {
    const [deployer] = await ethers.getSigners();

    // Dummy addresses for local test (staging will use real ones)
    const dummyPool = "0x00000000000000000000000000000000000000A1";
    const dummyOracle = "0x00000000000000000000000000000000000000B2";
    const dummyWeth = "0x00000000000000000000000000000000000000C3";
    const dummyDai = "0x00000000000000000000000000000000000000D4";

    const TestAaveLiquidation = await ethers.getContractFactory("TestAaveLiquidation");
    const test = await TestAaveLiquidation.deploy(dummyPool, dummyOracle, dummyWeth, dummyDai);
    await test.waitForDeployment();

    expect(await test.pool()).to.equal(dummyPool);
    expect(await test.oracle()).to.equal(dummyOracle);
    expect(await test.collateralAsset()).to.equal(dummyWeth);
    expect(await test.debtAsset()).to.equal(dummyDai);

    // On local with dummy pool/oracle, actual calls will revert – only test view wiring here
    await expect(test.getHealthFactor()).to.be.reverted;
  });
});

/*
Staging manual test flow:

1. Deploy with real pool+oracle+WETH+DAI addresses.
2. Call supply(collateralAsset, amount) from funded account.
3. Call borrow(debtAsset, amount, 2) (variable rate).
4. Read getHealthFactor() – expect > 1.5.
5. Call setPriceFeedValue(collateralAsset, lowerPrice) to drop ~30%.
6. Read getHealthFactor() – expect < 1.0.
7. Trigger liquidation from Aave UI / liquidator; inspect healthHistory + dashboard.
*/
