import { ethers, providers } from "ethers";
import { buildPoseidon } from "circomlibjs";
import { MerkleTree, poseidon1, toHex } from "../zkdrops-lib";

const DOMAIN = "";

export async function generateProofAndStore(key, secret, setLoading, setProof) {
  if (!key || !secret) {
    alert("Either key or secret is missing!");
    return;
  }

  setLoading(true);
  console.log("✅ Converting key & secret to BigInt");

  try {
    const provider = new providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    console.log("🔐 key:", key);
    console.log("🕵️‍♀️ secret:", secret);

    const keyBig = BigInt(key);
    const secretBig = BigInt(secret);

    // Poseidon (same as zkmain)
    const poseidonLib = await buildPoseidon();
    const poseidon = (args) => poseidonLib.F.toObject(poseidonLib(args));
    const rawCommitment = poseidon([keyBig, secretBig]);
    const commitment = BigInt.asUintN(256, rawCommitment);

    console.log("🧾 Final Poseidon Commitment (hex):", toHex(commitment));
    console.log("🔢 Final Poseidon Commitment (decimal):", commitment.toString());

    const mtText = await fetchText(`${DOMAIN}/mt_8192.txt`);
    const wasm = await fetchBuffer(`${DOMAIN}/circuit.wasm`);
    const zkey = await fetchBuffer(`${DOMAIN}/circuit_final.zkey`);

    const tree = MerkleTree.createFromStorageString(mtText.trim());

    console.log("🧪 Leaf count in parsed tree:", tree.leaves.length);
    console.log("🔍 Searching for:", commitment.toString());

    const leafIndex = tree.leaves.findIndex((leaf) => BigInt(leaf.val) === commitment);
    console.log("🔍 Leaf index found:", leafIndex);
    console.log("🪵 Parsed Merkle root:", tree.root.val.toString());
    console.log("🌱 First 5 leaves:", tree.leaves.slice(0, 5).map((leaf, i) => `#${i}: ${leaf.val.toString()}`));
    console.log("🌳 Merkle Root:", toHex(tree.root.val));

    if (leafIndex === -1) {
      alert("❌ Leaf not found in Merkle tree.");
      setLoading(false);
      return;
    }

    console.log("🌿 Leaf matched in tree:", tree.leaves[leafIndex]);
    console.log("📌 Leaf index:", leafIndex);

  
    const { vals: pathElements, indices: pathIndices } = tree.getMerkleProof(commitment);

    const input = {
      root: tree.root.val.toString(),
      nullifierHash: (await poseidon1(keyBig)).toString(),
      recipient: BigInt(address).toString(),
      nullifier: keyBig.toString(),
      secret: secretBig.toString(),
      pathElements: pathElements.map((e) => e.toString()),
      pathIndices,
    };

    // ⛓️ SNARKJS from public script
    if (!window.snarkjs || !window.snarkjs.plonk) {
      alert("❌ snarkjs not loaded. Please include snarkjs.min.js in your public/index.html");
      return;
    }

    const { plonk } = window.snarkjs;
    const { proof: zkProof, publicSignals } = await plonk.fullProve(input, wasm, zkey);
    const calldata = await plonk.exportSolidityCallData(zkProof, publicSignals);

    setProof(calldata);
  } catch (err) {
    console.error("❌ Proof generation failed:", err);
    alert("Proof generation failed. Check console.");
  }

  setLoading(false);
}

async function fetchText(url) {
  const res = await fetch(url);
  return await res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}

export async function collectZKDrop(proof, key, airdropContractAddress, setLoading) {
  try {
    setLoading(true);
    const response = await fetch("/api/zkdrop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proof, key, airdropContractAddress }),
    });

    const result = await response.json();
    setLoading(false);
    return result;
  } catch (error) {
    setLoading(false);
    console.error("ZKDrop collection failed:", error);
    throw error;
  }
}
