let mimcSponger: any = null;

export async function mimcSponge(l: bigint, r: bigint): Promise<bigint> {
  if (!mimcSponger) {
    console.log("🔄 Loading mimcSponge from circomlibjs...");
    const circomlibjs = await import("circomlibjs");

    if (typeof circomlibjs.buildMimcSponge === "function") {
      mimcSponger = await circomlibjs.buildMimcSponge();
    } else if (typeof circomlibjs.mimcSponge === "function") {
      mimcSponger = circomlibjs.mimcSponge;
    } else {
      throw new Error("❌ Neither buildMimcSponge nor mimcSponge is available.");
    }
  }

  const res = mimcSponger.multiHash([l, r]);
  return BigInt(res.toString());
}
