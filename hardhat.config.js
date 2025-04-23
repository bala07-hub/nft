require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();


const {
  REACT_APP_API_URL,
  REACT_APP_PRIVATE_KEY
} = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    localhost: {
      allowUnlimitedContractSize: true, // <== ✅ TEMPORARY HACK for local testing
    },
  },
};
