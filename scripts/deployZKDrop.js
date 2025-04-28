const { ethers } = require("hardhat");
const { readMerkleRoot } = require("./utils/readMerkleRoot"); // ✅

const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // ERC20
  const ERC20 = await ethers.getContractFactory("ERC20PresetFixedSupply");
  const initialSupply = ethers.utils.parseUnits("1000000", 18);
  const erc20 = await ERC20.deploy("ZKToken", "ZKT", initialSupply, deployer.address);
  await erc20.deployed();
  console.log("✅ ERC20 Token deployed to:", erc20.address);

  // Verifier
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log("✅ Verifier contract deployed to:", verifier.address);

  // ✅ Read correct Merkle root
  const merkleRoot = readMerkleRoot();
  console.log("✅ Correct Merkle Root:", merkleRoot);

  // PrivateAirdrop
  const amountPerUser = ethers.utils.parseUnits("1000", 18);
  const PrivateAirdrop = await ethers.getContractFactory("PrivateAirdrop");
  const airdrop = await PrivateAirdrop.deploy(
    erc20.address,
    amountPerUser,
    verifier.address,
    merkleRoot
  );
  await airdrop.deployed();
  console.log("✅ PrivateAirdrop contract deployed to:", airdrop.address);

  // Save addresses
  const deployedAddresses = {
    ERC20: erc20.address,
    Verifier: verifier.address,
    PrivateAirdrop: airdrop.address
  };
  const outputPath = path.join(__dirname, "../src/deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployedAddresses, null, 2));
  console.log("✅ Deployed addresses saved to src/deployed-addresses.json");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
