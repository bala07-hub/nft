"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mimcSponge = void 0;

// 🟢 Direct static import for reliability
const circomlibjs = require("circomlibjs");

let mimcSponger = circomlibjs.mimcsponge;

async function mimcSponge(l, r) {
    if (!mimcSponger) {
        throw new Error("❌ mimcsponge not available in circomlibjs.");
    }

    const res = mimcSponger.multiHash([l, r]);
    return BigInt(res.toString());
}

exports.mimcSponge = mimcSponge;
