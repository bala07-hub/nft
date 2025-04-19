import { MerkleTree, poseidon1, poseidon2, toHex } from 'zkdrops-lib';
import { groth16 } from 'snarkjs';
import { ethers, providers } from 'ethers';
import AIRDROP_JSON from '../abis/PrivateAirdrop.json';
//import { poseidon1, poseidon2 } from 'zkdrops-lib/lib/Poseidon';


const DOMAIN = "http://localhost:3000";

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
    const commitment = await poseidon2(keyBig, secretBig);
    console.log("🧾 Commitment generated:", toHex(commitment));

    // Load circuit files
    const mtText = await fetchText(`${DOMAIN}/mt_8192.txt`);
    const wasm = await fetchBuffer(`${DOMAIN}/circuit.wasm`);
    const zkey = await fetchBuffer(`${DOMAIN}/circuit_final.zkey`);

    // Rebuild tree from txt
    const tree = MerkleTree.createFromStorageString(mtText);

    const leafIndex = tree.leaves.findIndex((leaf) => BigInt(leaf.val) === commitment);
    if (leafIndex === -1) {
      alert("❌ Leaf not found in Merkle tree.");
      setLoading(false);
      return;
    }

    console.log("🌿 Leaf matched in tree:", tree.leaves[leafIndex]);
    console.log("📌 Leaf index:", leafIndex);
    console.log("✅ Commitment match?", BigInt(tree.leaves[leafIndex].val) === commitment);

    const proof = tree.generateProof(leafIndex);
    const root = tree.root.val.toString();

    const input = {
      root,
      nullifierHash: (await poseidon1(keyBig)).toString(),
      recipient: BigInt(address).toString(),
      nullifier: keyBig.toString(),
      secret: secretBig.toString(),
      pathElements: proof.siblings.map((s) => s.toString()),
      pathIndices: proof.pathIndices
    };

    const { proof: zkProof, publicSignals } = await groth16.fullProve(input, wasm, zkey);
    const calldata = await groth16.exportSolidityCallData(zkProof, publicSignals);

    const formatted = calldata.replace(/[[\]\s"]/g, '').split(',');
    const finalCalldata = {
      a: [formatted[0], formatted[1]],
      b: [[formatted[2], formatted[3]], [formatted[4], formatted[5]]],
      c: [formatted[6], formatted[7]],
      input: formatted.slice(8),
    };

    setProof(finalCalldata);
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
