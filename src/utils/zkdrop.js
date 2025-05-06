import { ethers } from "ethers";
import { MerkleTree, poseidon1, poseidon2, toHex } from "../zkdrops-lib";
import AIRDROP_ABI from "../abis/PrivateAirdrop.json";
import ERC20_ABI from "../abis/ERC20Token.json";
import deployedAddresses from "../deployed-addresses.json"; 
import { hexZeroPad, hexlify } from "ethers/lib/utils";
import { toast } from "react-toastify";

const DOMAIN = ""; // Update if needed

export async function generateProofAndStore(key, secret, setLoading, setProof) {
  if (!key || !secret) {
    toast.warn("Either key or secret is missing!");
    return;
  }

  setLoading(true);
  console.log("✅ Starting ZKDrop Proof Generation...");

  // 🧮 Field modulus for BN254
  const FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    console.log("🔐 Raw Key:", key);
    console.log("🕵️‍♀️ Raw Secret:", secret);

    const keyBig = BigInt(key);
    const secretBig = BigInt(secret);
    console.log("🔢 keyBig:", keyBig);
    console.log("🔢 secretBig:", secretBig);

    const rawCommitment = await poseidon2(keyBig, secretBig);
    const commitment = rawCommitment % FIELD_SIZE;

    console.log("🧾 Computed Poseidon Commitment (hex):", toHex(commitment));
    console.log("🔢 Commitment (decimal):", commitment.toString());

    const mtText = await fetchText(`${DOMAIN}/mt_8192.txt`);
    const wasm = await fetchBuffer(`${DOMAIN}/circuit.wasm`);
    const zkey = await fetchBuffer(`${DOMAIN}/circuit_final.zkey`);

    const tree = MerkleTree.createFromStorageString(mtText.trim());
    console.log("🌳 Total Leaves in Merkle Tree:", tree.leaves.length);

    const leafIndex = tree.leaves.findIndex((leaf) => BigInt(leaf.val) === commitment);
    console.log("🔍 Leaf Index:", leafIndex);
    if (leafIndex === -1) {
      console.error("❌ Leaf not found in Merkle Tree!");
      toast.error("❌ Leaf not found in Merkle tree.");
      setLoading(false);
      return;
    }

    console.log("🌿 ✅ Leaf Found:", tree.leaves[leafIndex].val.toString());
    console.log("🌲 Merkle Root:", toHex(tree.root.val));
    console.log("📊 Sample Leaves:", tree.leaves.slice(0, 3).map((leaf, i) => `#${i}: ${leaf.val.toString()}`));

    const { vals: pathElements, indices: pathIndices } = tree.getMerkleProof(commitment);

    console.log("🛤 Path Elements:", pathElements.map(e => e.toString()));
    console.log("🔢 Path Indices:", pathIndices);

    const rawNullifierHash = await poseidon1(keyBig);
    const nullifierHash = (rawNullifierHash % FIELD_SIZE + FIELD_SIZE) % FIELD_SIZE;


    const recipientBigInt = BigInt(address);
    const rootBigInt = tree.root.val;

    console.log("🧠 Sanitized nullifierHash (decimal):", nullifierHash.toString());
    console.log("🧠 recipient address BigInt:", recipientBigInt.toString());

    const input = {
      root: rootBigInt.toString(),
      nullifierHash: nullifierHash.toString(),
      recipient: recipientBigInt.toString(),
      nullifier: keyBig.toString(),
      secret: secretBig.toString(),
      pathElements: pathElements.map((e) => e.toString()),
      pathIndices
    };

    console.log("🔣 Input to ZK Proof:", input);

    if (!window.snarkjs || !window.snarkjs.plonk) {
      toast.error("❌ snarkjs not loaded. Please include snarkjs.min.js in your public/index.html");
      setLoading(false);
      return;
    }

    const { plonk } = window.snarkjs;
    const { proof: zkProof, publicSignals } = await plonk.fullProve(input, wasm, zkey);

    console.log("🧾 Public Signals:", publicSignals);
    console.log("🔐 ZK Proof:", zkProof);

    const calldataStr = await plonk.exportSolidityCallData(zkProof, publicSignals);
    const [proofOnly] = calldataStr.split(",");
    const sanitizedProof = proofOnly.replace(/[\[\]"\s]/g, "");
    const paddedNullifierHash = hexZeroPad(hexlify(nullifierHash), 32);

    console.log("📦 Final nullifierHash (bytes32):", paddedNullifierHash);

    setProof({
      proof: sanitizedProof,
      nullifierHash: paddedNullifierHash,
      commitment: toHex(commitment),
      leafIndex: leafIndex,
      merkleRoot: toHex(tree.root.val),
      address: address
    });

    console.log("✅ Proof successfully generated and stored.");
  } catch (err) {
    console.error("❌ Proof generation failed:", err);
    toast.error("Proof generation failed. See console for details.");
  }

  setLoading(false);
}


export async function collectDropDirect(proofData, setLoading) {
  try {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const airdropContract = new ethers.Contract(
      deployedAddresses.PrivateAirdrop,
      AIRDROP_ABI.abi,
      signer
    );

    const tokenContract = new ethers.Contract(
      deployedAddresses.ERC20,
      ERC20_ABI,
      signer
    );

    console.log("🚀 Sending collectAirdrop transaction...");
    const tx = await airdropContract.collectAirdrop(
      proofData.proof,
      proofData.nullifierHash
    );

    console.log("✅ collectAirdrop tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ collectAirdrop tx confirmed:", receipt.transactionHash);
    console.log("📦 collectAirdrop status:", receipt.status);

    let balanceFormatted = null;
    try {
      console.log("🎯 Fetching token balance...");
      const balance = await tokenContract.balanceOf(address);
      balanceFormatted = ethers.utils.formatUnits(balance, 18);
      console.log("✅ Balance fetched:", balanceFormatted);
    } catch (balanceError) {
      console.warn("⚠️ Unable to fetch balance. User can check wallet manually.", balanceError);
    }

    return {
      success: receipt.status === 1,
      txHash: receipt.transactionHash,
      balance: balanceFormatted, // could be null if fetch failed
    };
  } catch (error) {
    console.error("❌ Drop collection failed:", error);
    toast.error("❌ Drop collection failed. See console for details.");
    return {
      success: false,
      txHash: null,
      balance: null
    };
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
