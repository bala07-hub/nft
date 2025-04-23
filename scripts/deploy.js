const hre = require("hardhat");

async function main() {
    const DefiAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Defi contract
    const TweetsAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Tweets contract
    const privateAirdropAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // PrivateAirdrop contract
    const stakingAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"; // Staking contract ✅

    const NFTandDefiMerged = await hre.ethers.getContractFactory("NFTandDefiMerged");
    const contract = await NFTandDefiMerged.deploy(
        DefiAddress,
        TweetsAddress,
        privateAirdropAddress,
        stakingAddress // Pass this new argument here 👈
    );

    await contract.deployed();

    console.log("✅ NFTandDefiMerged contract deployed to:", contract.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
