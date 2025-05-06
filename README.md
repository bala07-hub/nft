# 🚀 NFT Marketplace with ZKDrop, AI Art & GIF Minting

A fully-featured decentralized NFT Marketplace powered by **Zero-Knowledge Proofs (zk-SNARKs)**, **AI-generated Art**, **Random Unsplash images**, **GIF creation via GIPHY**, and a staking mechanism. Built using **Solidity**, **React**, **Hardhat**, **Pinata IPFS**, and **zkdrops-lib**.

> 🔒 Powered by ZKDrop (Merkle Tree + zk-SNARK) model
> 🧠 Integrated with AI Art via Cloudflare Workers
> 🎞️ Supports GIFs (search or upload)
> 🌄 Random Unsplash image minting
> 🎮 ERC20-based staking rewards

## 🧩 Tech Stack

* **Frontend:** React.js, Tailwind CSS, Axios, React Toastify
* **Backend:** Node.js (optional), zkdrops-lib
* **Smart Contracts:** Solidity (via Hardhat)
* **Blockchain Network:** Hardhat Localhost or Sepolia Testnet
* **Storage:** Pinata (IPFS)
* **ZKP:** zkdrops-lib, snarkjs, circom
* **AI Art:** Cloudflare Workers API
* **GIFs:** Giphy API

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/NFTMarketplace_StakingMerged.git
cd NFTMarketplace_StakingMerged
```

### 2. Project Structure

```
├── contracts/                    # Smart Contracts
├── scripts/                      # Deployment Scripts
├── public/                       # cleanZKPairs.json, Merkle tree
├── src/Components/               # React Components
├── src/utils/zkdrop.js           # zk-SNARK generation logic
├── server.js                     # Optional backend for AI Art
```

### 3. Prepare Environment

```bash
npm install --legacy-peer-deps
npm uninstall typescript
npm install typescript@4.9.5 --save-dev
```

Create `.env.local` with the following:

```env
REACT_APP_API_URL=your_sepolia_rpc_url
REACT_APP_PRIVATE_KEY=your_wallet_private_key
REACT_APP_PINATA_API_KEY=your_pinata_key
REACT_APP_PINATA_SECRET=your_pinata_secret
REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
REACT_APP_GIPHY_API_KEY=your_giphy_api_key
REACT_APP_CLOUDFLARE_AI_URL=http://localhost:3004/generate-image
REACT_APP_SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

> ⚠️ Never commit your `.env.local` file. Use `.gitignore`.

## 📦 Deploy Smart Contracts

Run Hardhat local node:

```bash
npx hardhat node
```

Then deploy contracts:

```bash
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy1.js --network localhost
npx hardhat run scripts/deploy2.js --network localhost
npx hardhat run scripts/deployToken.js --network localhost
npx hardhat run scripts/deployStaking.js --network localhost
npx hardhat run scripts/deployZKDrop.js --network localhost
```

## 💻 Run the Application

```bash
npm start
```

> To run AI proxy server: `node server.js`

## 🧠 Features

### ✅ NFT Minting Options

* Upload your own image
* 🎨 **Random Art** from Unsplash
* 🤖 **AI-Generated Art** via Cloudflare
* 🎞️ **GIFs** from GIPHY
* ✨ **Custom GIF Editor**

### 🔐 ZKDrop: Zero-Knowledge Airdrop System

ZKDrop enables secure, private airdrops using:

* **Poseidon Hashing** of `key + secret`
* **Merkle Tree** for inclusion verification
* **zk-SNARKs** for private proof

#### 🔬 How it Works

```text
User → Generates Proof → Sends to Contract → Verifier.sol checks Merkle inclusion → Tokens Released
```

### 🧪 Testing ZKDrop Locally

1. Choose a `key` and `secret` pair from `public/backup/cleanZKPairs.json`
2. Paste them in the input fields in the UI
3. Click `Generate Proof` → If commitment is valid and present in Merkle tree, you’ll be able to `Collect Airdrop`

#### ♻️ Regenerating Merkle Tree & Proof Artifacts

1. **Generate Merkle Tree**

```bash
npx ts-node scripts/gen_tree_from_file.ts public/cleanZKPairs.json public/mt_8192.txt 13
```

2. **Compile and Setup Circuit**

```bash
circom circuit.circom --r1cs --wasm --sym
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="ZKDrop Contribution" -v
snarkjs zkey export verifier circuit_final.zkey contracts/Verifier.sol
```

## 💰 Staking

Stake ERTN tokens and earn rewards. View balance, reward rate, and claim via Staking tab.

## 🛠 Full Setup Summary (Command Order)

```bash
cd nft-marketplace
npx hardhat node

cd nft-marketplace
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/deploy1.js --network localhost
npx hardhat run scripts/deploy2.js --network localhost
npx hardhat run scripts/deployStaking.js --network localhost
npx hardhat run scripts/deployToken.js --network localhost
npx hardhat run scripts/deployZKDrop.js --network localhost

cd nft-marketplace-frontend
npm install --legacy-peer-deps
npm uninstall typescript
npm install typescript@4.9.5 --save-dev
npm install
npm start
```

## 🧪 Run Tests

```bash
npx hardhat test
```

## 🤝 Contributing

PRs welcome! 

## 📜 License


