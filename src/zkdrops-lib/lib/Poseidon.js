import { F1Field } from "ffjavascript";

let poseidonHasher = null;

export async function initPoseidon() {
  if (!poseidonHasher) {
    console.log("🔥 Poseidon dynamic import triggered...");
    const circomlibjs = await import("circomlibjs");
    console.log("📦 circomlibjs keys:", Object.keys(circomlibjs));

    const poseidon = circomlibjs.poseidon;
    const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    poseidon.F = new F1Field(p);

    poseidonHasher = poseidon;
    console.log("✅ Initialized Poseidon hasher");
  }

  return poseidonHasher;
}

export async function poseidon1(item) {
  const hasher = await initPoseidon();
  return BigInt(hasher.F.toString(hasher([BigInt(item)])));
}

export async function poseidon2(first, second) {
  const hasher = await initPoseidon();
  const inputArray = [BigInt(first), BigInt(second)];
  console.log("🧠 poseidon2 inputs:", inputArray);
  const result = hasher(inputArray);
  return BigInt(hasher.F.toString(result));
}
