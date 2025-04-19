const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // ✅ Deploy ERC20 Token with name and symbol
  const ERC20 = await ethers.getContractFactory("ERC20PresetFixedSupply");
  const initialSupply = ethers.utils.parseUnits("1000000", 18); // 1M tokens
  const erc20 = await ERC20.deploy("ZKToken", "ZKT", initialSupply, deployer.address);
  await erc20.deployed();
  console.log("✅ ERC20 Token deployed to:", erc20.address);

  // ✅ Deploy Verifier contract (from snarkjs export)
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.deployed();
  console.log("✅ Verifier contract deployed to:", verifier.address);

  // ✅ Deploy PrivateAirdrop contract
  const PrivateAirdrop = await ethers.getContractFactory("PrivateAirdrop");

  const amountPerUser = ethers.utils.parseUnits("1000", 18); // Airdrop 1000 tokens per user
  const merkleRoot = "0x42fcabf98e31aa9f9a6c35c0ec7f84d5c8ee63a9a4e0b65d1b8a6e3c61efbb5f"; // ⚠️ Replace this with actual root

  const airdrop = await PrivateAirdrop.deploy(
    erc20.address,
    amountPerUser,
    verifier.address,
    merkleRoot
  );
  await airdrop.deployed();
  console.log("✅ PrivateAirdrop contract deployed to:", airdrop.address);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
