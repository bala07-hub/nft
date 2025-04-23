import React, { useEffect, useState } from 'react';
import abi from './artifacts/contracts/NFTandDefiMerged.sol/NFTandDefiMerged.json';
import Home from './Components/Home';
import Web3 from 'web3';
import { ethers } from 'ethers';
import "./App.css";
import SignUp from './Components/SignUp';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const App = () => {
  const [sing, setsign] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const connectWallet = async () => {
      const contractAddress = "0x9B75e724284404a3b512b335DcB4b2e5dEF585D7";
      const contractABI = abi.abi;
  
      try {
        const { ethereum } = window;
        if (ethereum) {
          const accounts = await ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
          setContract(contract);
          setAccount(Web3.utils.toChecksumAddress(accounts[0].toLowerCase()));
  
          // 👇 Make contract accessible in dev console
          window.contract = contract;
  
          ethereum.on("accountsChanged", (newAccounts) => {
            setAccount(Web3.utils.toChecksumAddress(newAccounts[0].toLowerCase()));
            window.location.reload();
          });
  
          window.ethereum.on("chainChanged", () => {
            window.location.reload();
          });
        } else {
          alert("Please install MetaMask");
        }
      } catch (e) {
        console.log(e);
      }
    };
  
    connectWallet();
  }, []);
  

  const handler = async (e) => {
    e.preventDefault();

    try {
      console.log("🔐 Attempting login with:", account, password);
      const isValid = await contract.Login(account, password);
      console.log("✅ Login result:", isValid);

      if (isValid) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        toast.success("Login Successful!");
      } else {
        toast.error("Login Failed! Check password or wallet.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error(error?.reason || error?.message || "Login failed");
    }
  };

  if (isLoggedIn) {
    return <Home contract={contract} account={account} setIsLoggedIn={setIsLoggedIn} />;
  } else {
    return (
      <>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop 
          closeOnClick 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="colored"
        />
    
        {isLoggedIn ? (
          <Home contract={contract} account={account} setIsLoggedIn={setIsLoggedIn} />
        ) : (
          sing ? (
            <div className="lgbody">
              <center>
                <div className="lgbox">
                  <h2>LOGIN</h2>
                  <form className="form-group" onSubmit={handler}>
                    <label>Address</label><br />
                    <input
                      type="text"
                      className="form-control"
                      value={account}
                      readOnly
                    /><br />
                    <label>Password</label><br />
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    /><br />
                    <input type="submit" className="btn btn-secondary" value="Login" />
                  </form>
                  <p>Don't have an Account? <button onClick={() => setsign(false)} className="btn btn-secondary">Click here</button></p>
                </div>
              </center>
            </div>
          ) : (
            <SignUp contract={contract} account={account} />
          )
        )}
      </>
    );    
  }
};

export default App;
