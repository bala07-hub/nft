import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers';
import "./Styles.css"
const Feed = (props) => {
    const[data,setData] = useState([]);
    useEffect(()=>{
        const getData = async(e) =>{
          const mem = await props.contract.GetTextData();
          setData(mem);
        }
        props.contract && getData()
    },[props.contract,data])
    const posthandler =async(e)=>{
        e.preventDefault()
        const post = prompt("Whats New???")
        const amount ={value : ethers.utils.parseEther("0.0001")}
        try{
            const transaction = await props.contract.PostText(post,"none",props.account,amount);
            await transaction.wait()
            alert("Tweeted Successfull!!!!!!")
        }catch(e){
            alert(e.reason);
            console.log(e)
        }
    }
  return(props.trigger)?(
    <div>
        <div class="btnscontainer">
            <button className='btn btn-primary' id="postbtn" onClick={posthandler}>POST</button>
            <button className='btn btn-danger' id="closebtn" onClick={()=>{props.setTrigger(false)}}>Close</button>
        </div><br/><br/>
        <div class="feedcontainer">
            <center>
                { data.length == 0 ? <h5>No Tweets Yet</h5> :
                data.map((memo)=><div>
                        <div class="textblock">
                            <div class="textblockheading">
                                <img src={memo.Profile}  height="50px" width="50px"/>
                                <span title={memo.owner}>{memo.Fname} {memo.Lname}</span><br/>
                                <span>{new Date(memo.timestamp * 1000).toLocaleString()}</span>
                            </div><br/><br/>
                            {memo.NFTUrl=='none'?<p class="msg">{memo.text}</p>:<div><p>Hello Everyone I have shared NFT checkout</p><img src={memo.NFTUrl} width="100px" height="100px"/> <p>{memo.text}</p></div>}
                        </div><br/></div>
                )
                }
                
            </center>
          </div>
    </div>
  ):""
  
}

export default Feed