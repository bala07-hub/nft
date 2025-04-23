const { ethers } = require("hardhat");

async function main() {
  const rewardTokenAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // your localhost ERC20 token
  const rewardRate = ethers.utils.parseUnits("0.001", 18); // for example

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(rewardTokenAddress, rewardRate);
  await staking.deployed();

  console.log("✅ Staking contract deployed to:", staking.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
