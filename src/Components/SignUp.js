import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const SignUp = ({ account, contract }) => {
  const [fileLink, setFileLink] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadStatus1, setUploadStatus1] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);
      reader.onloadend = () => {
        setFile(selectedFile);
      };
    }
  };

  useEffect(() => {
    const uploadToIPFS = async () => {
      try {
        setUploadStatus("Uploading... Please wait.");
        const data = new FormData();
        data.append("file", file);

        const response = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          data,
          {
            headers: {
              pinata_api_key: 'bcdba470d62c79d6eac9',
              pinata_secret_api_key: '56200e139fdea26ed86005c791ba1780b3db165f30668b194cdb0870d5721a69',
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const ipfsUrl = `https://ipfs.io/ipfs/${response.data.IpfsHash}`;
        setFileLink(ipfsUrl);
        setUploadStatus("File uploaded successfully!");
      } catch (e) {
        alert("Unable to upload file. Please try again.");
        console.error(e);
        setUploadStatus("");
      }
    };

    if (file) uploadToIPFS();
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.password) {
      alert("Please fill in all fields.");
      return;
    }

    if (!fileLink) {
      alert("Please wait for the file to finish uploading.");
      return;
    }

    setUploadStatus1("Processing transaction... Please wait.");
    console.log("📦 Contract instance:", contract);

    const signerAddress = await contract.signer.getAddress();
    console.log("🧾 Signer address:", signerAddress);

    console.log("📄 Sending data:", {
      firstName: formData.firstName,
      lastName: formData.lastName,
      fileLink,
      account,
      password: formData.password
    });

    contract.SignUp(
      formData.firstName,
      formData.lastName,
      fileLink,
      account,
      formData.password,
      { value: ethers.utils.parseEther("0.00001") }
    ).then((tx) => {
      console.log("✅ Transaction sent: ", tx.hash);
      return tx.wait();
    }).then((receipt) => {
      console.log("🎉 Transaction confirmed in block:", receipt.blockNumber);
      alert("Sign-up successful!");
      setUploadStatus1("");
      window.location.reload();
    }).catch((error) => {
      console.error("❌ Transaction failed:", error);
      alert(error?.reason || error?.message || "Transaction failed.");
      setUploadStatus1("");
    });
    
  };

  return (
    <div>
      <center>
        <div className="signUpbox">
          <h2>SIGN UP</h2>
          <form className="form-group" onSubmit={handleSubmit}>
            <label>FIRST NAME</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              value={formData.firstName}
              onChange={handleInputChange}
            />

            <label>LAST NAME</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              value={formData.lastName}
              onChange={handleInputChange}
            />

            <label>Account</label>
            <input
              type="text"
              className="form-control"
              value={account || ""}
              readOnly
            />

            <label>PASSWORD</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleInputChange}
            />

            <label>Profile</label><br />
            <input type="file" onChange={handleFileChange} /><br />
            <p>{uploadStatus}</p>

            <input type="submit" value="SUBMIT" className="btn btn-secondary" />
          </form>

          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            CLOSE
          </button>
          <p>{uploadStatus1}</p>
        </div>
      </center>
    </div>
  );
};

export default SignUp;
