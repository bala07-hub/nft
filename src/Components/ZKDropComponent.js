import React, { useState } from "react";
import { generateProofAndStore, collectDropDirect } from "../utils/zkdrop";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ZKDropComponent = ({ setTrigger }) => {
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculateProof = async () => {
    try {
      setLoading(true);
      await generateProofAndStore(key, secret, setLoading, setProof);
      toast.success("✅ Proof generated successfully!");
    } catch (err) {
      toast.error("❌ Failed to generate proof. Please try again.");
      console.error(err);
    }
  };

  const handleCollectDrop = async () => {
    try {
      if (!proof) {
        toast.warn("⚠️ Please generate proof first.");
        return;
      }
      await collectDropDirect(proof, setLoading);
      toast.success("✅ Drop collected successfully!");
    } catch (err) {
      toast.error("❌ Drop collection failed.");
      console.error(err);
    }
  };

  return (
    <div style={{ backgroundColor: "#add8e6", color: "#000", minHeight: "100vh", padding: "2rem" }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />

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

            <button onClick={handleCollectDrop} className="btn btn-dark">
              {loading ? "Processing..." : "Collect Drop"}
            </button>

            <button onClick={() => setTrigger(false)} className="btn btn-danger">
              Close
            </button>
          </div>

          {proof && (
            <div style={{ marginTop: "1rem" }}>
              <h4>Generated Proof:</h4>
              <div style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                backgroundColor: "#f0f0f0",
                color: "#333",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}>
                {JSON.stringify(proof, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZKDropComponent;