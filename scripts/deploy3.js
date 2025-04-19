const hre = require("hardhat");
async function main() {
    const NFTMarketPlaceAurora = await hre.ethers.getContractFactory('NFTandDefiMerged');
    const contract = await NFTMarketPlaceAurora.deploy("COPIED_ADDRESS FROM DEFI","COPIED ADDRESS FROM TWEETS");
     await contract.deployed();
     console.log("Address of Contract : ",contract.address);  
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
