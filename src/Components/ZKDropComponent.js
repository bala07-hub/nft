import React, { useState } from "react";
import { generateProofAndStore } from "../utils/zkdrop";
// import { collectZKDrop } from "../utils/zkdrop"; // Uncomment if available

const ZKDropComponent = ({ setTrigger }) => {
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [proof, setProof] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCalculateProof = async () => {
    try {
      setLoading(true);
      await generateProofAndStore(key, secret, setLoading, setProof);
    } catch (err) {
      alert("Failed to generate proof. Please try again.");
      console.error(err);
    }
  };

  return (
    <div style={{ backgroundColor: "#add8e6", color: "#000", minHeight: "100vh", padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>ZKDrop Airdrop</h2>

      <div style={{
        maxWidth: "700px",
        margin: "auto",
        backgroundColor: "#ffffff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Enter Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              color: "#000"
            }}
          />

          <input
            type="text"
            placeholder="Enter Secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              color: "#000"
            }}
          />

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={handleCalculateProof} className="btn btn-dark">
              {loading ? "Calculating..." : "Calculate Proof"}
            </button>

            {/* Uncomment and configure when needed */}
            {/* <button onClick={() => collectZKDrop(proof, key, contractAddress, setLoading)} className="btn btn-dark">Collect Drop</button> */}

            <button
  onClick={async () => {
    try {
      setLoading(true);
      const res = await collectZKDrop(proof, key, "0xE0997837a7fc049D858D4Fe9A992e9caa5234D6b", setLoading); // Replace with your actual deployed address
      alert("✅ Drop collected successfully!");
    } catch (err) {
      alert("❌ Drop collection failed");
    }
  }}
  className="btn btn-dark"
>
  Collect Drop
</button>

            <button onClick={() => setTrigger(false)} className="btn btn-danger">
              Close
            </button>
          </div>

          {proof && (
            <div style={{ marginTop: "1rem" }}>
              <h4>Generated Proof:</h4>
              <textarea
                value={proof}
                readOnly
                style={{
                  width: "100%",
                  minHeight: "150px",
                  backgroundColor: "#f0f0f0",
                  color: "#333",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc"
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZKDropComponent;
