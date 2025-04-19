import React, { useEffect, useState } from "react";
import "./Styles.css";
const MyProducts = (props) => {
  const [product, setProduct] = useState({});
  const [tweetStatus, setTweetStatus] = useState(false);
  const [Userinfo, setUserInfo] = useState([]);
  const [ERTN, setERTN] = useState(0);
  const [data, setData] = useState([]);
  var count = 0;
  useEffect(() => {
    const getData = async (e) => {
      const mem = await props.contract.GetTextData();
      setData(mem);
      const data = await props.contract.GetUserData(props.account);
      for (var i = 0; i < mem.length; i++) {
        if (props.account == mem[i][5]) {
          setTweetStatus(true);
        }
      }
      setUserInfo(data);
      setERTN((await props.contract.checkbalance(props.account)).toString());
      try {
        const data = await props.contract.GetAllProducts();
        for (let i = 0; i < data.length; i++) {
          if (
            data[i].owner === props.account ||
            data[i].seller == props.account
          ) {
            const ProductID = data[i][0].toString();
            const imageUrl = data[i][1];
            const price = data[i][4].toString();
            const status = data[i][5];
            const nftname = data[i][6].toString();
            const priceERTN = data[i][7].toString();
            setProduct((prevProduct) => ({
              ...prevProduct,
              [ProductID]: [nftname, imageUrl, price, status, priceERTN],
            }));
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    props.contract && getData();
  }, [props.contract, product]);
  const hadndler = async (e, ProductId) => {
    e.preventDefault();
    var updatedPrice = prompt("Enter ETH Price:");
    var UpdatedERTNPrice = prompt("Enter ERTN price:");
    try {
      const transaction = await props.contract.Resale(
        ProductId,
        updatedPrice,
        UpdatedERTNPrice
      );
      await transaction.wait();
      alert("Resale Successfull..");
    } catch (e) {
      console.log(e);
      alert("Faild!! try again..");
    }
  };
  const deleteTweet = async (e, tweet) => {
    e.preventDefault();
    try {
      const transaction = await props.contract.DeletingText(
        props.account,
        tweet
      );
      await transaction.wait();
      alert("Tweet Deleted");
    } catch (e) {
      console.log(e);
      alert(e.reason);
    }
  };

  return props.trigger ? (
    // <h1>height</h1>
    // Object.keys(product).length==0?<center><h3 class="cartstatus">Your products are empty</h3><br/><button onClick={()=>props.setTrigger(false)} class="btn btn-danger">close</button></center>:
    <div class="outer">
      <h5>YOUR INFO</h5>

      <center>
        <br />
        <span>
          {Userinfo[0]} {Userinfo[1]}
        </span>
        <br />
        <br />
        <img
          src={Userinfo[2]}
          class="profileclass"
          height="100px"
          width="100px"
        />
        <br />
        <br />
        <span>{Userinfo[3]}</span>
        <br />
        <br />
      </center>
      <br />

      <h5>YOUR TOKENS : {ERTN} ERTNS</h5>
      <br />
      {tweetStatus == true ? <h5>YOUR TWEETS </h5> : ""}
      <center>
        {data.map((memo) =>
          memo.owner == props.account ? (
            <div>
              <div class="textblock">
                <p>
                  {new Date(memo.timestamp * 1000).toLocaleString()}&nbsp;
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3096/3096687.png"
                    onClick={(e) => {
                      deleteTweet(e, count++);
                    }}
                    width="20px"
                    height="20px"
                  />
                </p>
                {memo.NFTUrl == "none" ? (
                  <p class="msg">{memo.text}</p>
                ) : (
                  <div>
                    <p>Hello Everyone I have shared NFT checkout</p>
                    <img
                      src={memo.NFTUrl}
                      title="Delete Tweet"
                      width="100px"
                      height="100px"
                    />{" "}
                    <p>{memo.text}</p>
                  </div>
                )}
              </div>
              <br />
            </div>
          ) : (
            <p></p>
          )
        )}
      </center>
      <br />
      {Object.keys(product).length == 0 ? (
        <span></span>
      ) : (
        <center>
          <h5>YOUR NFTS</h5>
        </center>
      )}
      <div className="inner">
        {Object.entries(product).map(
          (
            [ProductID, [nftname, imageUrl, price, status, priceERTN]],
            index
          ) => (
            <div className="Productitem" key={index}>
              <div className="productbody">
                <center>
                  <img
                    src={imageUrl}
                    width="260px"
                    height="200px"
                    alt="Product"
                  />
                  <br />
                  <br />
                  <p>{nftname}</p>
                  <p>
                    <b>
                      Price: {price} Wei or {priceERTN}ERTN
                    </b>
                  </p>
                  <p>
                    {status == true ? (
                      <p>NFT in Sale</p>
                    ) : (
                      <button
                        class="btn btn-secondary"
                        onClick={(e) => hadndler(e, ProductID)}
                      >
                        Resale
                      </button>
                    )}
                  </p>
                </center>
              </div>
            </div>
          )
        )}
      </div>
      <br />
      <center>
        <button onClick={() => props.setTrigger(false)} class="btn btn-danger">
          close
        </button>
      </center>
    </div>
  ) : (
    ""
  );
};

export default MyProducts;
