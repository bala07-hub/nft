const fs = require("fs");
const path = require("path");
const { MerkleTree } = require("../src/zkdrops-lib/lib/MerkleTree"); // Adjust path as needed

(async () => {
  // ✅ 1. Read and parse Merkle tree leaves (extract all 0x... hex values)
  const treeRaw = fs.readFileSync(path.join(__dirname, "../public/mt_8192.txt"), "utf8");
  const leaves = treeRaw
    .match(/0x[a-f0-9]+/gi)
    .map(hex => BigInt(hex));

  // ✅ 2. If odd number of leaves, duplicate last leaf to make it even
  if (leaves.length % 2 !== 0) {
    leaves.push(leaves[leaves.length - 1]);
  }

  // ✅ 3. Rebuild Merkle tree from leaves
  const tree = await MerkleTree.createFromLeaves(leaves);

  // ✅ 4. Load key-secret pairs
  const allPairs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../public/validKeySecretMapping.json"), "utf8")
  );

  const usablePairs = [];

  // ✅ 5. For each pair, check if its commitment exists in the Merkle tree
  for (const pair of allPairs) {
    const { commitment } = pair;
    try {
      const commitmentBigInt = BigInt(commitment);
      const proof = tree.getMerkleProof(commitmentBigInt);
      if (proof && proof.vals.length > 0) {
        usablePairs.push(pair);
      }
    } catch (err) {
      // Skip if not found or proof fails
    }
  }

  // ✅ 6. Save usable pairs
  fs.writeFileSync(
    path.join(__dirname, "../public/usableKeySecrets.json"),
    JSON.stringify(usablePairs, null, 2),
    "utf8"
  );

  console.log(`✅ Done. Found ${usablePairs.length} usable key-secret pairs.`);
})();
