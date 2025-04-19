require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const {
  REACT_APP_API_URL,
  REACT_APP_PRIVATE_KEY
} = process.env;

module.exports = {
  solidity: "0.8.1",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: REACT_APP_API_URL,
      accounts: [REACT_APP_PRIVATE_KEY]
    }
  }
};