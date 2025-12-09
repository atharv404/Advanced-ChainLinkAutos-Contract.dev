const { ethers } = require("hardhat");

// Chainlink price feed interface
const aggregatorAbi = [
  "function latestRoundData() external view returns (uint80,int256,uint256,uint256,uint80)"
];

async function getPrice(feedAddress) {
  const provider = ethers.provider;
  const feed = new ethers.Contract(feedAddress, aggregatorAbi, provider);
  const [, answer] = await feed.latestRoundData();
  return answer;
}

async function supplyAave(aaveContract, amountEth) {
  const tx = await aaveContract.supplyETH({ value: amountEth });
  return tx.wait();
}

async function borrowAave(aaveContract, amount, rateMode) {
  const tx = await aaveContract.borrow(amount, rateMode);
  return tx.wait();
}

async function repayAave(aaveContract, amount, rateMode) {
  const tx = await aaveContract.repay(amount, rateMode, { value: amount });
  return tx.wait();
}

async function getHealthFactor(aaveContract) {
  return aaveContract.getHealthFactor();
}

module.exports = {
  getPrice,
  supplyAave,
  borrowAave,
  repayAave,
  getHealthFactor
};
