import { F1Field } from "ffjavascript";

let poseidonHasher: any = null;

async function initPoseidon(): Promise<any> {
  if (!poseidonHasher) {
    console.log("🔥 Poseidon dynamic import triggered...");
    const circomlibjs = await import("circomlibjs");
    console.log("📦 circomlibjs keys:", Object.keys(circomlibjs));

    if (typeof circomlibjs.poseidon !== "function") {
      throw new Error("❌ circomlibjs.poseidon is not a function. Library might be outdated.");
    }

    poseidonHasher = circomlibjs.poseidon;

    // Get the BabyJub field modulus
    const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    poseidonHasher.F = new F1Field(p);

    console.log("✅ Initialized Poseidon hasher");
  }
  return poseidonHasher;
}

export async function poseidon1(item: bigint): Promise<bigint> {
  const hasher = await initPoseidon();
  return BigInt(hasher.F.toString(hasher([item])));
}

export async function poseidon2(first: bigint, second: bigint): Promise<bigint> {
  const hasher = await initPoseidon();
  return BigInt(hasher.F.toString(hasher([first, second])));
}
