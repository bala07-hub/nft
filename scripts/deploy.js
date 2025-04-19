const hre = require("hardhat");

async function main() 
{
    const DefiAddress = "0x9608dfc14B70E4d8B6Aa6B6236686B2Da030332d"; // Defi contract address
    const TweetsAddress = "0x3Ab4520Bc2fb95414AA999Ff7DCb610f9E1fe9C7"; // Tweets contract address

    const NFTandDefiMerged = await hre.ethers.getContractFactory("NFTandDefiMerged");
    const contract = await NFTandDefiMerged.deploy(DefiAddress, TweetsAddress);
    await contract.deployed();

    console.log("NFTandDefiMerged contract deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});