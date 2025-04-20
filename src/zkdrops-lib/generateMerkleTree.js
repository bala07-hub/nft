const fs = require('fs');
const path = require('path');
const circomlibjs = require('circomlibjs');
// adjust if not in lib/
const { MerkleTree } = require('./lib/MerkleTree');

async function main() {
  console.log("🔥 Poseidon dynamic import triggered...");
  const key = BigInt("0x00c06a7aa765bc92bab643baf757ee456f1ee890f690c09ba9a6be7533cf8e17");
  const secret = BigInt("0x009968cc4b34a8a1dc99d503565c2c29707d336d877a1c5510a8679eb8398be2");

  const commitment = await poseidon2(key, secret);
  console.log("✅ Commitment:", commitment.toString());

  const leafCount = 8192;
  const leaves = [commitment, ...Array(leafCount - 1).fill(BigInt(0))];
  const tree = await MerkleTree.createFromLeaves(leaves);
  const treeStr = tree.getStorageString();

  const filePath = path.join(__dirname, 'mt_8192.txt');
  fs.writeFileSync(filePath, treeStr);
  console.log(`✅ Merkle tree written to ${filePath}`);
}

main();
