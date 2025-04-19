const hre = require("hardhat");

async function main() {
    // Get the contract factory for Defi.sol
    const Defi = await hre.ethers.getContractFactory("Defi");

    // Deploy the contract
    const defiContract = await Defi.deploy();

    // Wait for deployment to complete
    await defiContract.deployed();

    // Log the deployed contract address
    console.log("Defi contract deployed to:", defiContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
