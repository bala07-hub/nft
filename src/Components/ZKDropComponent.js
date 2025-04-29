import React, { useState, useEffect } from "react";
import { generateProofAndStore, collectDropDirect } from "../utils/zkdrop";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ZKDropComponent = ({ setTrigger }) => {
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [proof, setProof] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);

  useEffect(() => {
    setProof(null); // Clear old proof when key or secret changes
  }, [key, secret]);

  const handleCalculateProof = async () => {
    if (!key || !secret) {
      toast.error("Key and Secret are required to generate proof");
      return;
    }

    setIsCalculating(true);
    try {
      const success = await generateProofAndStore(key, secret, setIsCalculating, setProof);
      if (success) toast.success("Proof generated successfully!");
    } catch (err) {
      console.error("Error during proof generation:", err);
      toast.error("Proof generation failed. See console for details.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCollectDrop = async () => {
    try {
      setIsProcessingDrop(true);
      const result = await collectDropDirect(proof, setIsProcessingDrop);
      if (result.success) {
        toast.success(
          <div>
            🎉 Drop collected! <br />
            <strong>Tx:</strong>{" "}
            <a href={`https://sepolia.etherscan.io/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">
              {result.txHash.slice(0, 10)}...
            </a><br />
            <strong>New Balance:</strong> {result.balance} ZKT
          </div>,
          { autoClose: 10000 }
        );
      }
    } catch (error) {
      console.error("Error during drop collection:", error);
      toast.error("Drop collection failed. See console for details.");
    } finally {
      setIsProcessingDrop(false);
    }
  };

  const showProgress = isCalculating || isProcessingDrop;

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
            <button onClick={handleCalculateProof} className="btn btn-dark" disabled={isCalculating}>
              {isCalculating ? "Generating..." : "Calculate Proof"}
            </button>

            <button onClick={handleCollectDrop} className="btn btn-dark" disabled={!proof || isProcessingDrop}>
              {isProcessingDrop ? "Processing..." : "Collect Drop"}
            </button>

            <button onClick={() => setTrigger(false)} className="btn btn-danger">
              Close
            </button>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div style={{ marginTop: "10px" }}>
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: "100%" }}
                >
                  {isCalculating ? "Generating Proof..." : "Processing Drop..."}
                </div>
              </div>
            </div>
          )}

          {/* Proof details display */}
          {proof && (
            <div style={{ marginTop: "2rem" }}>
              <h4>Proof Details:</h4>
              <div style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                backgroundColor: "#f0f0f0",
                color: "#333",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}>
                <div><strong>Commitment:</strong> {proof.commitment}</div>
                <div><strong>Leaf Index:</strong> {proof.leafIndex}</div>
                <div><strong>Merkle Root:</strong> {proof.merkleRoot}</div>
                <div><strong>Wallet Address:</strong> {proof.address}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZKDropComponent;
