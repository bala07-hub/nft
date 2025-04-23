// scripts/testIntegration.js

const { ethers } = require("hardhat");

async function main() {
  const [deployer, user] = await ethers.getSigners();

  // Replace with your deployed addresses
  const airdropAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const stakingAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const nftMergedAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const erc20Address = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  const Airdrop = await ethers.getContractAt("PrivateAirdrop", airdropAddress);
  const Staking = await ethers.getContractAt("Staking", stakingAddress);
  const NFTMerged = await ethers.getContractAt("NFTandDefiMerged", nftMergedAddress);
  const Token = await ethers.getContractAt("ZKToken", erc20Address);



  console.log("Deployer:", deployer.address);
  console.log("User:", user.address);

  // Step 1: Mint some tokens to the user for staking
  const mintAmount = ethers.utils.parseEther("100");
  await Token.transfer(user.address, mintAmount);
  console.log("✅ Transferred tokens to user");

  // Step 2: Approve tokens for staking
  await Token.connect(user).approve(Staking.address, mintAmount);
  await Staking.connect(user).stake(mintAmount);
  console.log("✅ User staked tokens");

  // Wait for time to pass to accumulate rewards
  console.log("⏳ Waiting for rewards to accumulate...");
  await new Promise((res) => setTimeout(res, 3000));

  const pending = await Staking.pendingReward(user.address);
  console.log("🔁 Pending reward:", ethers.utils.formatEther(pending));

  await Staking.connect(user).claimReward();
  console.log("✅ Claimed staking rewards");

  // Step 3: Airdrop test - assume proof/key/secret are known and valid
  console.log("🚧 Skipping collectDrop test here - integrate if needed with proofGen");

  // Step 4: Mint NFT - only works if drop was claimed
  try {
    const tx = await NFTMerged.connect(user).MintProduct(
        "https://some-uri.com",      // Product URI
        ethers.utils.parseEther("0.01"),  // price in ETH
        "Test NFT",                  // Product name
        100,                         // ERTN price
        user.address,                // pubkey
        false                        // postPic
    );
    
    const receipt = await tx.wait();
    console.log("✅ Minted NFT:", receipt.transactionHash);
  } catch (err) {
    console.log("❌ Mint failed - likely drop not claimed:", err.message);
  }

  // Step 5: Check staked balance
  const staked = await Staking.stakedAmount(user.address);
  console.log("📦 Staked balance:", ethers.utils.formatEther(staked));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
