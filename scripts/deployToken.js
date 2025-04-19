async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying token with account:", deployer.address);
  
    const Token = await ethers.getContractFactory("ERC20PresetFixedSupply");
    const token = await Token.deploy("ZKToken", "ZKT", ethers.utils.parseEther("1000000"), deployer.address);
  
    await token.deployed();
    console.log("✅ ERC20 Token deployed to:", token.address);
  }
  
  main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
  });
  