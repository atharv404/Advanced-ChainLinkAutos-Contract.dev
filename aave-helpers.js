require("dotenv").config();
const { ethers } = require("hardhat");

function getAavePoolAddress() {
  return process.env.AAVE_POOL;
}

function getOracleAddress() {
  return process.env.MANUAL_ORACLE;
}

function formatHealthFactor(raw) {
  // Aave HF is typically 1e18-fixed; adjust if staging uses different base
  const bn = ethers.toBigInt(raw);
  return Number(bn) / 1e18;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  getAavePoolAddress,
  getOracleAddress,
  formatHealthFactor,
  sleep
};
