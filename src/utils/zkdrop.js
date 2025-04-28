import { ethers } from "ethers";
import { buildPoseidon } from "circomlibjs";
import { MerkleTree, poseidon1, toHex } from "../zkdrops-lib";
import AIRDROP_ABI from "../abis/PrivateAirdrop.json";
import ERC20_ABI from "../abis/ERC20Token.json";
import deployedAddresses from "../deployed-addresses.json"; // ✅ NEW import
import { hexZeroPad, hexlify } from "ethers/lib/utils";
import { toast } from "react-toastify";

const DOMAIN = ""; // Update if needed

export async function generateProofAndStore(key, secret, setLoading, setProof) {
  if (!key || !secret) {
    toast.warn("Either key or secret is missing!");
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
      toast.error("❌ Leaf not found in Merkle tree.");
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
      toast.error("❌ snarkjs not loaded. Please include snarkjs.min.js in your public/index.html");
      return;
    }

    const { plonk } = window.snarkjs;
    const { proof: zkProof, publicSignals } = await plonk.fullProve(input, wasm, zkey);
    const calldataStr = await plonk.exportSolidityCallData(zkProof, publicSignals);

    const [proofOnly] = calldataStr.split(",");
    const sanitizedProof = proofOnly.replace(/[\[\]"\s]/g, "");
    const paddedNullifierHash = hexZeroPad(hexlify(BigInt(input.nullifierHash)), 32);
    console.log("📦 Final nullifierHash (bytes32):", paddedNullifierHash);

    setProof({
      proof: sanitizedProof,
      nullifierHash: paddedNullifierHash,
      commitment: toHex(commitment),
      leafIndex: leafIndex,
      merkleRoot: toHex(tree.root.val),
      address: address
    });
  } catch (err) {
    console.error("❌ Proof generation failed:", err);
    toast.error("Proof generation failed. Check console.");
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
