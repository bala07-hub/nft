"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poseidon2 = exports.poseidon1 = void 0;
const ffjavascript_1 = require("ffjavascript");
let poseidonHasher = null;
async function initPoseidon() {
    if (!poseidonHasher) {
        console.log("🔥 Poseidon dynamic import triggered...");
        const circomlibjs = await Promise.resolve().then(() => require("circomlibjs"));
        console.log("📦 circomlibjs keys:", Object.keys(circomlibjs));
        if (typeof circomlibjs.poseidon !== "function") {
            throw new Error("❌ circomlibjs.poseidon is not a function. Library might be outdated.");
        }
        poseidonHasher = circomlibjs.poseidon;
        // Get the BabyJub field modulus
        const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
        poseidonHasher.F = new ffjavascript_1.F1Field(p);
        console.log("✅ Initialized Poseidon hasher");
    }
    return poseidonHasher;
}
async function poseidon1(item) {
    const hasher = await initPoseidon();
    return BigInt(hasher.F.toString(hasher([item])));
}
exports.poseidon1 = poseidon1;
async function poseidon2(first, second) {
    const hasher = await initPoseidon();
    return BigInt(hasher.F.toString(hasher([first, second])));
}
exports.poseidon2 = poseidon2;
