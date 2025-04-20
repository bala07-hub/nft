"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pedersenHashBuff = void 0;
// @ts-ignore -- no types
const circomlibjs_1 = require("circomlibjs");
let pedersenHasher;
let babyjub;
async function pedersenHashBuff(buff) {
    if (!pedersenHasher) {
        pedersenHasher = await (0, circomlibjs_1.buildPedersenHash)();
    }
    if (!babyjub) {
        babyjub = await (0, circomlibjs_1.buildBabyJub)();
    }
    let point = pedersenHasher.hash(buff);
    return babyjub.unpackPoint(point)[0];
}
exports.pedersenHashBuff = pedersenHashBuff;
