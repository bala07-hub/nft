import React, { useEffect, useState } from "react";
import "./Styles.css";
import Cart from "./Cart";
import Mint from "./Mint";
import MyProducts from "./MyProducts";
import TokenStaking from "./TokenStaking";
import Feed from "./Feed";
import { generateProofAndStore } from '../utils/zkdrop';

const Home = (props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState({});
  const [items, setItems] = useState({});
  const [total, setTotal] = useState(0);
  const [ERTNtotal, setERTNtotal] = useState(0);
  const [pop, setPop] = useState(false);
  const [pop2, setPop2] = useState(false);
  const [pop3, setPop3] = useState(false);
  const [pop4, setPop4] = useState(false);
  const [pop5, setPop5] = useState(false);
  const [product, setProduct] = useState({});
  const [ProductPrices, setProductPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState("");

  useEffect(() => {
    const getProductValues = async () => {
      try {
        const data = await props.contract.GetAllProducts();

        for (let i = 0; i < data.length; i++) {
          const ProductID = data[i][0].toString();
          const imageUrl = data[i][1];
          const seller = data[i][3];
          const price = data[i][4].toString();
          const status = data[i][5];
          const nftname = data[i][6].toString();
          const priceERTN = data[i][7].toString();
          setProduct((prevProduct) => ({
            ...prevProduct,
            [ProductID]: [nftname, imageUrl, price, status, seller, priceERTN],
          }));
        }
      } catch (e) {
        console.log(e);
      }
    };
    props.contract && getProductValues();
  }, [props.contract, total, product]);

  const handleBuyClick = (nftname, price, imageUrl, ProductID, priceERTN) => {
    setItems((prevCart) => ({
      ...prevCart,
      [ProductID]: [nftname, imageUrl, price, priceERTN],
    }));
    setTotal(total + parseInt(price));
    setERTNtotal(ERTNtotal + parseInt(priceERTN));
  };

  const filterProducts = () => {
    const filtered = Object.entries(product).filter(([ProductID, [nftname]]) =>
      nftname.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(Object.fromEntries(filtered));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    filterProducts();
  };

  return (
    <div>
      <div className="header">
        <a href="#deftault" className="logo">
          NFT MarketPlace
        </a>
        <div className="header-right">
          <a
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              props.setIsLoggedIn(false);
            }}
          >
            SIGN OUT
          </a>
          <a
            onClick={() => {
              setPop3(true);
              setPop(false);
              setPop2(false);
              setPop4(false);
              setPop5(false);
            }}
          >
            PROFILE
          </a>
          <a
            onClick={() => {
              setPop4(true);
              setPop3(false);
              setPop(false);
              setPop2(false);
              setPop5(false);
            }}
          >
            STAKING
          </a>
          <a
            onClick={() => {
              setPop4(false);
              setPop3(false);
              setPop(false);
              setPop2(false);
              setPop5(true);
            }}
          >
            FEED
          </a>
        </div>
      </div>
      <Feed trigger={pop5} setTrigger={setPop5} contract={props.contract} account={props.account} />
      <TokenStaking trigger={pop4} setTrigger={setPop4} contract={props.contract} account={props.account} />
      <Mint trigger={pop2} setTrigger={setPop2} contract={props.contract} account={props.account} />
      <MyProducts trigger={pop3} setTrigger={setPop3} contract={props.contract} account={props.account} />
      <Cart
        trigger={pop}
        setTrigger={setPop}
        cartItems={items}
        Products={product}
        items={items}
        setProducts={setProduct}
        setItem={setItems}
        TotalPayment={total}
        setTotalPayment={setTotal}
        TotalPayment1={ERTNtotal}
        setTotalPayment1={setERTNtotal}
        contract={props.contract}
        account={props.account}
      />

      {pop === false && pop2 === false && pop3 === false && pop4 === false && pop5 === false ? (
        <div className="outer">
          <center>
            <a>CONNECTED TO: {props.account}</a>
          </center>
          <br />
          <div className="NFTHeader">
            <center>
              <a href="#deftault" className="logo">
                LIVE NFTS
              </a>
            </center>
            <input
              type="text"
              placeholder="Search NFT Name"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <div className="NFTHeaderElemts">
              <a
                onClick={() => {
                  setPop2(true);
                  setPop(false);
                  setPop3(false);
                  setPop4(false);
                  setPop5(false);
                }}
              >
                LIST
              </a>
              <a
                onClick={() => {
                  setPop(true);
                  setPop2(false);
                  setPop3(false);
                  setPop4(false);
                  setPop5(false);
                }}
              >
                CART
              </a>
            </div>
          </div>
          {Object.keys(product).length === 0 ? (
            <center>
              <h5>Currently No Live NFTS</h5>
            </center>
          ) : (
            ""
          )}
          <div className="inner">
            {Object.entries(searchQuery ? filteredProducts : product).map(
              ([ProductID, [nftname, imageUrl, price, status, seller, priceERTN]], index) =>
                status === false ? (
                  ""
                ) : (
                  <div className="Productitem" key={index}>
                    <div className="productbody">
                      <center>
                        <img src={imageUrl} width="260px" height="200px" alt="Product" />
                        <p>{nftname}</p>
                        <span><b>{seller}</b></span>
                        <p>
                          <b>
                            Price: {price} Wei or {priceERTN} ERTNS
                          </b>
                        </p>
                        <div className="d-flex justify-content-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              handleBuyClick(nftname, price, imageUrl, ProductID, priceERTN);
                              alert("Added to Cart");
                            }}
                            className="btn btn-dark"
                          >
                            BUY
                          </button>
                          <button
                            onClick={async () => {
                              const key = prompt("Enter your key");
                              const secret = prompt("Enter your secret");
                              try {
                                await generateProofAndStore(key, secret, setLoading, setProof);
                                //await collectZKDrop(proof, key, "0xE0997837a7fc049D858D4Fe9A992e9caa5234D6b", setLoading);
                              } catch (e) {
                                alert("Something went wrong during ZKDrop.");
                                console.error(e);
                              }
                            }}
                            className="btn btn-dark"
                          >
                            ZKDrop
                          </button>
                        </div>
                      </center>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Home;