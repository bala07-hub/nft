"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = exports.generateProofCallData = void 0;
/**
 * Library which abstracts away much of the details required to interact with the private airdrop contract.
 */
const snarkjs = window.snarkjs;

const Poseidon_1 = require("./Poseidon");
async function generateProofCallData(merkleTree, key, secret, receiverAddr, circuitWasmBuffer, zkeyBuffer) {
    let inputs = await generateCircuitInputJson(merkleTree, key, secret, BigInt(receiverAddr));
    let { proof, publicSignals } = await snarkjs.plonk.fullProve(inputs, circuitWasmBuffer, zkeyBuffer);
    let proofProcessed = unstringifyBigInts(proof);
    let pubProcessed = unstringifyBigInts(publicSignals);
    let allSolCallData = await snarkjs.plonk.exportSolidityCallData(proofProcessed, pubProcessed);
    let solCallDataProof = allSolCallData.split(',')[0];
    return solCallDataProof;
}
exports.generateProofCallData = generateProofCallData;
function toHex(number, length = 32) {
    const str = number.toString(16);
    return '0x' + str.padStart(length * 2, '0');
}
exports.toHex = toHex;
async function generateCircuitInputJson(mt, nullifier, secret, recieverAddr) {
    let commitment = await (0, Poseidon_1.poseidon2)(nullifier.valueOf(), secret.valueOf());
    let mp = mt.getMerkleProof(commitment);
    let nullifierHash = await (0, Poseidon_1.poseidon1)(nullifier.valueOf());
    let inputObj = {
        root: mt.root.val,
        nullifierHash: nullifierHash,
        nullifier: nullifier,
        secret: secret,
        pathIndices: mp.indices,
        pathElements: mp.vals,
        recipient: recieverAddr
    };
    return inputObj;
}
// Lifted from ffutils: https://github.com/iden3/ffjavascript/blob/master/src/utils_bigint.js
function unstringifyBigInts(o) {
    if ((typeof (o) == "string") && (/^[0-9]+$/.test(o))) {
        return BigInt(o);
    }
    else if ((typeof (o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o))) {
        return BigInt(o);
    }
    else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    }
    else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    }
    else {
        return o;
    }
}
function toBufferLE(bi, width) {
    const hex = bi.toString(16);
    const buffer = Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex');
    buffer.reverse();
    return buffer;
}
