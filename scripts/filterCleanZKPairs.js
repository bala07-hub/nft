const fs = require("fs");
const path = require("path");
const circomlib = require("circomlibjs");
const { MerkleTree } = require("../src/zkdrops-lib/lib/MerkleTree");

function normalizeHex(hex) {
  const clean = hex.trim().toLowerCase();
  return clean.startsWith("0x") ? clean : "0x" + clean;
}

function toBigInt(hex) {
  return BigInt(normalizeHex(hex));
}

(async () => {
  console.log("🔥 Poseidon static import from circomlibjs...");
  const poseidon = circomlib.poseidon;
  console.log("✅ Poseidon initialized");

  console.log("📁 Loading key-secret pairs...");
  const allPairs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../public/keySecretMapping.json"), "utf8")
  );

  console.log("📁 Loading Merkle tree...");
  const treeRaw = fs.readFileSync(path.join(__dirname, "../public/mt_8192.txt"), "utf8");
  const tree = MerkleTree.createFromStorageString(treeRaw);

  const cleanPairs = [];

  for (const [i, pair] of allPairs.entries()) {
    try {
      const key = toBigInt(pair.key);
      const secret = toBigInt(pair.secret);
      const expectedCommitment = normalizeHex(pair.commitment);

      const computedCommitment = "0x" + poseidon([key, secret]).toString(16);

      if (computedCommitment !== expectedCommitment) {
        console.log(`❌ Commitment mismatch at index ${i}`);
        continue;
      }

      const commitmentBigInt = BigInt(expectedCommitment);
      if (!tree.leafExists(commitmentBigInt)) {
        console.log(`❌ Leaf not found at index ${i}`);
        continue;
      }

      const proof = tree.getMerkleProof(commitmentBigInt);
      if (!proof || !proof.vals || proof.vals.length === 0) {
        console.log(`❌ Merkle proof failed at index ${i}`);
        continue;
      }

      cleanPairs.push(pair);
    } catch (err) {
      console.warn(`⚠️ Skipping pair at index ${i} due to error:`, err.message);
    }
  }

  const outPath = path.join(__dirname, "../public/cleanZKPairs.json");
  fs.writeFileSync(outPath, JSON.stringify(cleanPairs, null, 2), "utf8");

  console.log(`✅ Done. Found ${cleanPairs.length} clean, working key-secret pairs.`);
})();
