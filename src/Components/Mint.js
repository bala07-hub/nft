import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './Styles.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GifEditor from '../Components/GifEditor';

const Mint = (props) => {
  const [filelink, setFileLink] = useState();
  const [file, setFile] = useState(false);
  const [uploadstatus, setUploadS] = useState();
  const [MintStatus, setMintStatus] = useState();
  const [artSource, setArtSource] = useState("upload");
  const [showEditor, setShowEditor] = useState(false);
  const [giphySearchTerm, setGiphySearchTerm] = useState("");
  const [giphyResults, setGiphyResults] = useState([]);
  const [selectedGifUrl, setSelectedGifUrl] = useState('');
  const [randomArtUrl, setRandomArtUrl] = useState('');
const [randomArtPreview, setRandomArtPreview] = useState('');


  useEffect(() => {
    const handler = async () => {
      try {
        setUploadS('Uploading to IPFS...');
        const formData = new FormData();
        formData.append('file', file);
        const redFile = await axios({
          method: 'post',
          url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
          data: formData,
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET,
            'Content-Type': 'multipart/form-data',
          },
        });
        const ImgHash = `https://ipfs.io/ipfs/${redFile.data.IpfsHash}`;
        setFileLink(ImgHash);
        setUploadS('');
      } catch (e) {
        console.error("Upload failed:", e);
        toast.error("❌ File upload failed. Try again.");
        setUploadS('');
      }
    };
    file && handler();
  }, [file]);

  const onchangeHandler = (e) => {
    const data = e.target.files[0];
    if (data) {
      setFile(data);
    }
  };

  const fetchRandomArt = async () => {
    try {
      const UNSPLASH_URL = `https://api.unsplash.com/photos/random?query=nature&orientation=landscape&client_id=${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`;
      const res = await fetch(UNSPLASH_URL);
      const data = await res.json();
  
      if (data && data.urls && data.urls.regular) {
        setRandomArtUrl(data.urls.regular);
        setRandomArtPreview(data.urls.small); // for displaying preview
      } else {
        throw new Error("Invalid image response from Unsplash.");
      }
    } catch (error) {
      console.error("Failed to fetch random art:", error);
      toast.error("Failed to fetch random art.");
    }
  };
  
  
  

  const searchGiphy = async () => {
    try {
      if (!giphySearchTerm.trim()) return;
      const url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(giphySearchTerm)}&api_key=${process.env.REACT_APP_GIPHY_API_KEY}&limit=5`;
      const response = await axios.get(url);
      setGiphyResults(response.data.data);
    } catch (error) {
      console.error("Error fetching Giphy:", error);
    }
  };

  const handleSelectGif = async (gifUrl) => {
    try {
      const response = await axios.get(gifUrl, { responseType: "blob" });
      const blob = response.data;

      const formData = new FormData();
      formData.append("file", new File([blob], "selected.gif"));

      const upload = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET,
          "Content-Type": "multipart/form-data",
        },
      });

      const pinUrl = `https://ipfs.io/ipfs/${upload.data.IpfsHash}`;
      setFileLink(pinUrl);
      setSelectedGifUrl(gifUrl);

      toast.success("✅ GIF uploaded and selected for minting!");
    } catch (err) {
      console.error("Failed to fetch/upload GIF:", err);
      toast.error("❌ Could not fetch or upload selected GIF.");
    }
  };

  const handleArtSourceChange = (e) => {
    const value = e.target.value;
    setArtSource(value);
    if (value === "editor") {
      setShowEditor(true);
    } else {
      setShowEditor(false);
    }
  };

  const submithandler = async (e) => {
    e.preventDefault();
    const price = document.querySelector('#price').value;
    const price1 = document.querySelector('#priceERTN').value;
    const nftname = document.querySelector('#nftname').value;
    let checkboxStatus = document.querySelector('.checkbox').checked;

    let finalFileLink = filelink;

    try {
      if (artSource === "random") {
        if (!randomArtUrl) {
          toast.error("Please click 'Generate Random Art' before listing.");
          return;
        }
        const response = await fetch(randomArtUrl);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append("file", new File([blob], "random-art.jpg"));
      
        const upload = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET,
            "Content-Type": "multipart/form-data",
          },
        });
      
        finalFileLink = `https://ipfs.io/ipfs/${upload.data.IpfsHash}`;
      }
       else if (artSource === "ai") {
        const aiResponse = await axios.post(
          process.env.REACT_APP_CLOUDFLARE_AI_URL,
          { prompt: "Generate trending futuristic NFT art" },
          { responseType: "blob" }
        );
        const formData = new FormData();
        formData.append("file", new File([aiResponse.data], "ai-art.png"));
        const ipfsUpload = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET,
            "Content-Type": "multipart/form-data",
          },
        });
        finalFileLink = `https://ipfs.io/ipfs/${ipfsUpload.data.IpfsHash}`;
      } else if (!finalFileLink) {
        toast.error("No file selected or generated");
        return;
      }

      const ethPrice = ethers.utils.parseEther(price);
      const ertnPrice = ethers.BigNumber.from(price1);
      const amount = { value: ethers.utils.parseEther('0.00001') };

      setMintStatus('Minting NFT...');
      const transaction = await props.contract.MintProduct(
        finalFileLink,
        ethPrice,
        nftname,
        ertnPrice,
        props.account,
        checkboxStatus,
        amount
      );

      await transaction.wait();
      setMintStatus('');
      toast.success('✅ NFT Minted Successfully!', {
        position: 'top-right',
        autoClose: 3000,
        pauseOnHover: true,
        theme: 'colored',
      });
      window.location.reload();
    } catch (e) {
      console.error("Minting failed:", e);
      setMintStatus('');
      toast.error('❌ Minting failed. Check console.', {
        position: 'top-right',
        autoClose: 3000,
        pauseOnHover: true,
        theme: 'colored',
      });
    }
  };

  return props.trigger ? (
    <div className="upload-body">
      <center>
        <div className="upload-form">
          <h5>UPLOAD NFT</h5>
          <form className="form-group" onSubmit={submithandler}>
            <input type="text" value={props.account} className="form-control" readOnly /><br />
            <input type="text" placeholder="NFT Name" className="form-control" id="nftname" /><br />
            <input type="text" placeholder="Price (in ETH)" className="form-control" id="price" /><br />
            <input type="text" placeholder="Price (in ERTN Token)" className="form-control" id="priceERTN" /><br />

            <label>Select Art Source:</label>
            <select className="form-control" value={artSource} onChange={handleArtSourceChange}>
              <option value="upload">Upload File</option>
              <option value="random">Random Art</option>
              <option value="ai">AI Future Trends</option>
              <option value="gif">GIF Creator</option>
              <option value="editor">Advanced GIF Editor</option>
            </select>

            <br />

            {artSource === "random" && (
  <div className="random-art-preview" style={{ marginBottom: "1rem" }}>
    <button
      type="button"
      className="btn btn-primary mb-2"
      onClick={fetchRandomArt}
    >
      Generate Random Art
    </button>
    {randomArtPreview && (
      <img
        src={randomArtPreview}
        alt="Random Art Preview"
        style={{ width: "300px", borderRadius: "8px" }}
      />
    )}
  </div>
)}

            {artSource === "upload" && (
              <>
                <input type="file" onChange={onchangeHandler} className="form-control" /><br />
                <p>{uploadstatus}</p>
              </>
            )}

            {artSource === "gif" && (
              <div className="gif-creator">
                <h5>Search Giphy:</h5>
                <input
                  type="text"
                  placeholder="Search GIFs (e.g., cat, meme)"
                  value={giphySearchTerm}
                  onChange={(e) => setGiphySearchTerm(e.target.value)}
                  className="form-control"
                />
                <button className="btn btn-info mt-2 mb-2" type="button" onClick={searchGiphy}>
                  Search Giphy
                </button>
                {giphyResults.length > 0 && (
                  <div className="giphy-results" style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {giphyResults.map((gif) => (
                      <img
                        key={gif.id}
                        src={gif.images.fixed_height.url}
                        alt="gif"
                        style={{
                          cursor: 'pointer',
                          margin: '5px',
                          width: '120px',
                          border: selectedGifUrl === gif.images.original.url ? '4px solid #4caf50' : '2px solid transparent',
                          borderRadius: '6px',
                        }}
                        onClick={() => handleSelectGif(gif.images.original.url)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {showEditor && (
              <div style={{ marginBottom: "1rem" }}>
                <GifEditor onClose={() => setShowEditor(false)} />
              </div>
            )}

            <div style={{ marginTop: "2rem" }}>
              <div className="checkbox-group" style={{ marginBottom: "1rem" }}>
                <input type="checkbox" className="checkbox" />
                <label className="checkboxlabel" style={{ marginLeft: "8px" }}>
                  Mark to share on Feed
                </label>
              </div>

              <div className="d-flex justify-content-center gap-3" style={{ marginBottom: "1rem" }}>
                <input type="submit" value="LIST" className="btn btn-success" />
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditor(true)}>
                  Share
                </button>
                <button type="button" className="btn btn-danger" onClick={() => props.setTrigger(false)}>
                  CLOSE
                </button>
              </div>

              <div>
                <span style={{ fontWeight: "bold" }}>{MintStatus}</span>
              </div>
            </div>
          </form>
        </div>
      </center>
    </div>
  ) : null;
};

export default Mint;
