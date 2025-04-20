import { ethers } from "ethers";
import { buildPoseidon } from "circomlibjs";
import { MerkleTree, poseidon1, toHex } from "../zkdrops-lib";
import AIRDROP_ABI from "../abis/PrivateAirdrop.json";
import { hexZeroPad, hexlify } from "ethers/lib/utils"; 
const DOMAIN = "";

export async function generateProofAndStore(key, secret, setLoading, setProof) {
  if (!key || !secret) {
    alert("Either key or secret is missing!");
    return;
  }

  setLoading(true);
  console.log("✅ Converting key & secret to BigInt");

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    console.log("🔐 key:", key);
    console.log("🕵️‍♀️ secret:", secret);

    const keyBig = BigInt(key);
    const secretBig = BigInt(secret);

    // ✅ Poseidon hash
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

    const leafIndex = tree.leaves.findIndex((leaf) => BigInt(leaf.val) === commitment);
    console.log("🔍 Leaf index found:", leafIndex);
    if (leafIndex === -1) {
      alert("❌ Leaf not found in Merkle tree.");
      setLoading(false);
      return;
    }

    console.log("🌿 Leaf matched in tree:", tree.leaves[leafIndex]);
    console.log("📌 Leaf index:", leafIndex);
    console.log("🌳 Merkle Root:", toHex(tree.root.val));
    console.log("🌱 First 5 leaves:", tree.leaves.slice(0, 5).map((leaf, i) => `#${i}: ${leaf.val.toString()}`));

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

    if (!window.snarkjs || !window.snarkjs.plonk) {
      alert("❌ snarkjs not loaded. Please include snarkjs.min.js in your public/index.html");
      return;
    }

    const { plonk } = window.snarkjs;
    const { proof: zkProof, publicSignals } = await plonk.fullProve(input, wasm, zkey);
    const calldataStr = await plonk.exportSolidityCallData(zkProof, publicSignals);

    // Only extract the first part (proof) from the calldata string
    const [proofOnly] = calldataStr.split(",");
    const sanitizedProof = proofOnly.replace(/[\[\]"\s]/g, "");
    
    // ✅ Convert and pad nullifierHash to bytes32
    const paddedNullifierHash = hexZeroPad(hexlify(BigInt(input.nullifierHash)), 32);
    console.log("📦 Final nullifierHash (bytes32):", paddedNullifierHash);
    
    setProof({
      proof: sanitizedProof,
      nullifierHash: paddedNullifierHash
    });
    
    

  } catch (err) {
    console.error("❌ Proof generation failed:", err);
    alert("Proof generation failed. Check console.");
  }
  


  setLoading(false);
}

export async function collectDropDirect(proofData, setLoading) {
  try {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const airdropContract = new ethers.Contract(
      "0x0165878A594ca255338adfa4d48449f69242Eb8F", // Replace with your actual deployed PrivateAirdrop contract address
      AIRDROP_ABI.abi,
      signer
    );

    const tx = await airdropContract.collectAirdrop(
      proofData.proof,
      proofData.nullifierHash
    );

    await tx.wait();
    alert("✅ Drop collected successfully!");
  } catch (error) {
    console.error("❌ Drop collection failed:", error);
    alert("❌ Drop collection failed. See console for details.");
  } finally {
    setLoading(false);
  }
}

async function fetchText(url) {
  const res = await fetch(url);
  return await res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}
