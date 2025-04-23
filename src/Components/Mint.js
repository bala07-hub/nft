import React from 'react'
import { useState,useEffect } from 'react';
import { ethers } from 'ethers';
import Web3 from 'web3';
import axios from 'axios';
import './Styles.css'
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Mint = (props) => {
    const [filelink,setFileLink] = useState();
    const [file,setFile] = useState(false);
    const [uploadstatus,setUploadS] = useState();
    const [MintStatus,setMintStatus] = useState();
    useEffect(()=>{
        const handler = async(e) =>{
          try{
            setUploadS("Please wait..")
            const formData = new FormData();
            formData.append("file",file);
            const redFile = await axios({
              method:"post",
              url:'https://api.pinata.cloud/pinning/pinFileToIPFS',
              data:formData,
              headers:{
                pinata_api_key :'bcdba470d62c79d6eac9',
                pinata_secret_api_key:'56200e139fdea26ed86005c791ba1780b3db165f30668b194cdb0870d5721a69',
                "Content-Type":"multipart/form-data",
              }
            });
            const ImgHash =`https://ipfs.io/ipfs/${redFile.data.IpfsHash}`;
            setFileLink(ImgHash);
            setUploadS();
          }catch(e){
            alert("Unable to upload try again");
            console.log(e)
          }
        }
        file && handler();
    },[file])
    const onchangeHadler = async(e) =>{
        const data = e.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
        reader.onloadend = () =>{
          setFile(e.target.files[0]);
        };
    }
    const submithandler = async (e) => {
      e.preventDefault();
      const price = document.querySelector("#price").value;
      const price1 = document.querySelector("#priceERTN").value;
      const nftname = document.querySelector("#nftname").value;
      let checboxStatus = document.querySelector(".checkbox").checked;
    
      try {
        const ethPrice = ethers.utils.parseEther(price);      // Convert string to BigNumber
        const ertnPrice = ethers.BigNumber.from(price1);       // Only if price1 is an integer
    
        const amount = { value: ethers.utils.parseEther("0.00001") };
        const transaction = await props.contract.MintProduct(
          filelink,
          ethPrice,
          nftname,
          ertnPrice,
          props.account,
          checboxStatus,
          amount
        );
    
        setMintStatus("Please Wait...");
        await transaction.wait();
        setMintStatus("");
        toast.success("✅ NFT Minted Successfully!", {
          position: "top-right",
          autoClose: 3000,
          pauseOnHover: true,
          theme: "colored",
        });
        
        window.location.reload();
    
      } catch (e) {
        setMintStatus("");
        console.log(e);
        toast.error("❌ Minting failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          pauseOnHover: true,
          theme: "colored",
        });
        
      }
    }
    
  return (props.trigger)?(
    <div class="upload-body">
    <br/><br/>
    <center>
    <div class="upload-form">
      <center>
        <h5>UPLOAD NFT</h5><br/>
        <form class="form-group" onSubmit={submithandler}>
            <input type="text" value={props.account} class="form-control"/><br/>
            <input type="text" placeholder='NFT Name' class="form-control" id="nftname"/><br/>
            <input type="text" placeholder='Price (in ETH)' class="form-control" id="price"/><br/>
            <input type="text" placeholder='Price (in ERTN Token)' class="form-control" id="priceERTN"/><br/>
            <input type="file" onChange={onchangeHadler} id="fl" class="form-control"/><br/>
            <p>{uploadstatus}</p>
            <input type="checkbox" class="checkbox"/><label class="checkboxlabel">Mark to share on Feed</label>
            <input type="submit" value={"LIST"} class="btn btn-secondary"/>
        </form>
        <span>{MintStatus}</span> <br/>
        <button onClick={()=>props.setTrigger(false)} class="btn btn-danger">CLOSE</button>
        </center>
    </div>
    </center>
  </div>):""
}

export default Mint
