const fs = require("fs");
const path = require("path");
const circomlib = require("circomlibjs");
const { MerkleTree } = require("../src/zkdrops-lib/lib/MerkleTree");

// Utility: Normalize hex with 0x
function normalizeHex(hex) {
  const clean = hex.trim().toLowerCase();
  return clean.startsWith("0x") ? clean : "0x" + clean;
}

// Generate random 32-byte hex
function randomHex32() {
  return "0x" + [...Array(32)].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
}

(async () => {
  const poseidon = circomlib.poseidon;
  const F = poseidon.F;

  const NUM_PAIRS = 8192;
  const keySecretCommitments = [];
  const leaves = [];

  console.log("🔄 Generating key-secret pairs and commitments...");

  for (let i = 0; i < NUM_PAIRS; i++) {
    const key = BigInt(normalizeHex(randomHex32()));
    const secret = BigInt(normalizeHex(randomHex32()));
    const commitment = poseidon([key, secret]);


    keySecretCommitments.push({
      key: "0x" + key.toString(16),
      secret: "0x" + secret.toString(16),
      commitment: "0x" + commitment.toString(16)

    });

    leaves.push(commitment);
  }

  console.log("🌳 Building Merkle tree...");
  const tree = await MerkleTree.createFromLeaves(leaves);

  // Save Merkle tree
  const treeOut = path.join(__dirname, "../public/mt_8192.txt");
  fs.writeFileSync(treeOut, tree.getStorageString(), "utf8");

  // Save full mapping
  const mapOut = path.join(__dirname, "../public/keySecretMapping.json");
  fs.writeFileSync(mapOut, JSON.stringify(keySecretCommitments, null, 2), "utf8");

  console.log(`✅ Done. Saved ${NUM_PAIRS} pairs.`);
  console.log(`📁 Merkle tree: ${treeOut}`);
  console.log(`📁 Mappings:    ${mapOut}`);
})();
