const fs = require("fs");
const path = require("path");

function readMerkleRoot() {
  const mtPath = path.join(__dirname, "../../public/mt_8192.txt");
  const mtText = fs.readFileSync(mtPath, "utf8").trim();

  const lines = mtText.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error("mt_8192.txt seems malformed: not enough lines.");
  }

  // ✅ Assume second line is the actual root
  const rootDecimal = lines[0];
  const rootBigInt = BigInt(rootDecimal);
  const rootHex = "0x" + rootBigInt.toString(16).padStart(64, "0");

  return rootHex;
}

module.exports = { readMerkleRoot };
