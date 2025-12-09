require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { CONTRACT_DEV_RPC, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    contractDevEthereum: {
      url: CONTRACT_DEV_RPC || "",
      chainId: 59547,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
