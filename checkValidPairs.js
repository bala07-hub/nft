const fs = require("fs");
const path = require("path");
const circomlib = require("circomlibjs");

const normalizeHex = (hexStr) => {
  let clean = hexStr.trim().toLowerCase();
  return clean.startsWith("0x") ? clean : "0x" + clean;
};

const main = async () => {
  const poseidon = circomlib.poseidon; // ✅ legacy access in v0.0.8

  const poseidonHash = (inputs) =>
    "0x" + BigInt(poseidon(inputs)).toString(16);

  const csvPath = path.join("./mt_keys_8192.csv");
  const treePath = path.join("./mt_8192.txt");

  const treeData = fs.readFileSync(treePath, "utf8");
  const merkleLeaves = treeData
    .split(",")
    .map((line) => normalizeHex(line))
    .filter((line) => line.length > 2);

  const leafSet = new Set(merkleLeaves);

  const csvLines = fs.readFileSync(csvPath, "utf8").split("\n");
  const validPairs = [];
  csvLines.slice(1).forEach((line, idx) => {

    const [keyRaw, secretRaw] = line.split(",").map((x) => x?.trim());
    if (!keyRaw || !secretRaw) return;

    try {
      const key = BigInt(normalizeHex(keyRaw));
      const secret = BigInt(normalizeHex(secretRaw));
      const commitmentHex = poseidonHash([key, secret]);

      if (leafSet.has(commitmentHex)) {
        validPairs.push({
          index: idx+1,
          key: normalizeHex(keyRaw),
          secret: normalizeHex(secretRaw),
          commitment: commitmentHex,
        });
      }
    } catch (e) {
      console.warn(`❌ Skipping line ${idx} — error: ${e.message}`);
    }
  });

  fs.writeFileSync(
    "validKeySecretMapping.json",
    JSON.stringify(validPairs, null, 2),
    "utf8"
  );

  console.log(`✅ Done. Found ${validPairs.length} valid key-secret pairs.`);
};

main();
