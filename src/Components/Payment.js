import React, { useState } from "react";
import Web3 from "web3";

const Payment = ({ setShowPayment, paymentType }) => {
  const [network, setNetwork] = useState(
    "https://eth-sepolia.g.alchemy.com/v2/YE36wh3GLfr_SwA39o85lMXhdWk9xbJy"
  );
  const [privateKey, setPrivateKey] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [estimatedGasFee, setEstimatedGasFee] = useState("");
  const [actualGasFee, setActualGasFee] = useState("");
  let interval;

  const web3 = new Web3(new Web3.providers.HttpProvider(network));

  const logMessage = (message, type) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { message, type: type === "error" ? "red" : "green" },
    ]);
  };

  const validateAddress = (address) => web3.utils.isAddress(address);

  const fetchBalance = async (address) => {
    try {
      const balance = await web3.eth.getBalance(address);
      const etherBalance = web3.utils.fromWei(balance, "ether");
      logMessage(`Balance of ${address}: ${etherBalance} ETH`, "success");
    } catch (error) {
      logMessage(
        `Error fetching balance for ${address}: ${error.message}`,
        "error"
      );
    }
  };

  const sendTransaction = async (e) => {
    e.preventDefault();
    if (!validateAddress(fromAddress) || !validateAddress(toAddress)) {
      logMessage("Invalid address(es)!", "error");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      const gasPrice = await web3.eth.getGasPrice();
      const adjustedGasPrice = Math.floor(parseInt(gasPrice) * 1.2);
      const gasEstimate = await web3.eth.estimateGas({
        to: toAddress,
        from: fromAddress,
        value: web3.utils.toWei(amount, "ether"),
      });

      const estimatedFee = web3.utils.fromWei(
        (gasEstimate * adjustedGasPrice).toString(),
        "ether"
      );
      setEstimatedGasFee(estimatedFee);

      const tx = {
        to: toAddress,
        from: fromAddress,
        value: web3.utils.toWei(amount, "ether"),
        gas: gasEstimate,
        gasPrice: adjustedGasPrice,
      };

      interval = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 5;
          return newProgress <= 100 ? newProgress : 100;
        });
      }, 1000);

      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      const receipt = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );

      clearInterval(interval);
      setProgress(100);

      const actualFee = web3.utils.fromWei(
        (receipt.gasUsed * parseInt(gasPrice)).toString(),
        "ether"
      );
      setActualGasFee(actualFee);

      setStatus(`Transaction successful! Hash: ${receipt.transactionHash}`);
      logMessage(
        `Transaction successful! Hash: ${receipt.transactionHash}`,
        "success"
      );
    } catch (error) {
      clearInterval(interval);
      setLoading(false);
      setStatus(`Transaction failed: ${error.message}`);
      logMessage(`Transaction failed: ${error.message}`, "error");
    }
  };

  return (
    <div className="payment">
      <h1>Send {paymentType === "ETH" ? "ETH" : "ERTN"}</h1>
      <form onSubmit={sendTransaction}>
        <label>Network:</label>
        <select value={network} onChange={(e) => setNetwork(e.target.value)}>
          <option value="https://eth-sepolia.g.alchemy.com/v2/YE36wh3GLfr_SwA39o85lMXhdWk9xbJy">
            Sepolia
          </option>
        </select>
        <br />

        <label>Private Key:</label>
        <input
          type="text"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          required
        />
        <br />

        <label>From Address:</label>
        <input
          type="text"
          value={fromAddress}
          onChange={(e) => setFromAddress(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() =>
            validateAddress(fromAddress)
              ? logMessage(`From address ${fromAddress} is valid.`, "success")
              : logMessage(`From address ${fromAddress} is invalid.`, "error")
          }
        >
          Validate
        </button>
        <br />

        <label>To Address:</label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() =>
            validateAddress(toAddress)
              ? logMessage(`To address ${toAddress} is valid.`, "success")
              : logMessage(`To address ${toAddress} is invalid.`, "error")
          }
        >
          Validate
        </button>
        <br />

        <label>Amount ({paymentType}):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          required
        />
        <br />

        <button type="submit">Send Transaction</button>
        <button
          type="button"
          onClick={() => {
            if (validateAddress(fromAddress)) fetchBalance(fromAddress);
            if (validateAddress(toAddress)) fetchBalance(toAddress);
          }}
        >
          Fetch Balances
        </button>
      </form>

      {loading && (
        <div id="loading">
          <p>Transaction in progress...</p>
          <div id="progressBar">
            <div id="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <p>Progress: {progress}%</p>
          <p>Estimated Gas Fee: {estimatedGasFee} ETH</p>
          <p>Actual Gas Fee: {actualGasFee} ETH</p>
        </div>
      )}

      <div id="status">{status}</div>
      <div id="logs">
        {logs.map((log, index) => (
          <div key={index} style={{ color: log.type }}>
            {log.message}
          </div>
        ))}
      </div>

      <button onClick={() => setShowPayment(false)} className="btn btn-danger">
        Close
      </button>
    </div>
  );
};

export default Payment;
