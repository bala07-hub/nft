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
  const poseidon = circomlib.poseidon;

  console.log("📁 Loading key-secret pairs...");
  const allPairs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../public/keySecretMapping.json"), "utf8")
  );

  console.log("📁 Loading Merkle tree...");
  const treeRaw = fs.readFileSync(path.join(__dirname, "../public/mt_8192.txt"), "utf8");
  const tree = MerkleTree.createFromStorageString(treeRaw);

  const trueUsablePairs = [];

  for (const pair of allPairs) {
    try {
      const key = toBigInt(pair.key);
      const secret = toBigInt(pair.secret);
      const expectedCommitment = normalizeHex(pair.commitment);
      const actualCommitment = "0x" + poseidon([key, secret]).toString(16);

      console.log("🔑 Key:     ", pair.key);
      console.log("🕵️‍ Secret:  ", pair.secret);
      console.log("🎯 Expected Commitment:", expectedCommitment);
      console.log("⚙️  Poseidon Commitment:", actualCommitment);

      if (actualCommitment !== expectedCommitment) {
        console.log("❌ Commitment mismatch!\n");
        continue;
      }

      const commitmentBigInt = BigInt(expectedCommitment);

      if (!tree.leafExists(commitmentBigInt)) {
        console.log("🌿 ❌ Leaf not found in Merkle tree!\n");
        continue;
      }

      const proof = tree.getMerkleProof(commitmentBigInt);
      if (!proof || !proof.vals || proof.vals.length === 0) {
        console.log("📛 Invalid proof structure.\n");
        continue;
      }

      console.log("✅ Pair is usable and has valid proof.\n");
      trueUsablePairs.push(pair);
    } catch (err) {
      console.log("⚠️  Error processing pair:", err.message, "\n");
      // skip on any failure
    }
  }

  const outPath = path.join(__dirname, "../public/confirmedWorkingPairs.json");
  fs.writeFileSync(outPath, JSON.stringify(trueUsablePairs, null, 2), "utf8");

  console.log(`✅ Done. Found ${trueUsablePairs.length} truly usable key-secret pairs.`);
})();
