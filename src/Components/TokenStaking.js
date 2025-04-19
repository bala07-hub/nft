import React, { useEffect, useState} from 'react';
import './Styles.css';
const TokenStaking = (props) => {
  const [AvailableTokens,setAvailableTokens] = useState(0);
  const [StakedTokens,setStakedTokens] = useState(0);
  const [StakedAt,SetStakedAt] = useState();
  const [TranStatusPurachse,SetTranStatusPurachse]=useState();
  const [TranStatusSTAKE,SetTranStatusSTAKE]=useState();
  const [TranStatusUNSTAKE,SetTranStatusUNSTAKE]=useState();
  useEffect(()=>{
    const getData = async(e)=>{
      setAvailableTokens((await props.contract.checkbalance(props.account)).toString());
      try{
        const Data1 = await props.contract.Stakedamount(props.account);
        const Data2 = await props.contract.Stakedtime(props.account);
        
        console.log(Data1.toString())
        var timeStamp_value = Data2.toLocaleString();
        console.log(new Date(timeStamp_value * 1000))
        setStakedTokens(Data1.toString())
        SetStakedAt(new Date(timeStamp_value * 1000).toString())
      }catch(e){
        console.log(e);
      }
    }
    props.contract && getData()
  },[props.contract,AvailableTokens,StakedTokens,StakedAt])
const BuyHandler = async(e)=>{
  e.preventDefault();
  const tokens = document.querySelector("#tokens1").value;
  // alert("hi")
  try{
    const transaction = await props.contract.BuyTokens(tokens,props.account);
    SetTranStatusPurachse("Please wait ...")
    await transaction.wait();
    document.querySelector("#tokens1").value="";
    SetTranStatusPurachse("");
    alert("Tokens Purchase Successfull");
    window.location.reload();
  }catch(e){
    SetTranStatusPurachse("");
    alert(e.reason);
    console.log(e);
  }
}
const StakeHandler = async(e)=>{
  e.preventDefault();
  const tokens = document.querySelector("#tokens2").value;
  try{
    const transaction = await props.contract.StakeTokens(tokens,props.account);
    SetTranStatusSTAKE("Please wait...");
    await transaction.wait();
    document.querySelector("#tokens2").value=""
    SetTranStatusSTAKE("");
    alert("Tokens Staked Successfull");
    window.location.reload();
  }catch(e){
    SetTranStatusSTAKE("");
    alert(e.reason);
    console.log(e);    
  }
}
const UnStakeHandler = async(e)=>{
  e.preventDefault();
  const tokens = document.querySelector("#tokens3").value;
  try{
    const transaction = await props.contract.UnstakeTokens(tokens,props.account);
    SetTranStatusUNSTAKE("Please wait...");
    await transaction.wait();
    document.querySelector("#tokens3").value="";
    SetTranStatusUNSTAKE("");
    alert("Tokens Unstaked Successfull");
    window.location.reload();
  }catch(e){
    SetTranStatusUNSTAKE("");
    alert(e.reason);
    console.log(e); 
  }
}
  return (props.trigger)?(
    <div>
      <div className="outer">
      <div class="results">
        <div class="results_in">
          <span>Token Balance : {AvailableTokens}</span>
        </div>
        <div class="results_in">
          <span>Staked Tokens : {StakedTokens}</span>{StakedTokens == 0 ?"" :<div><span>At {StakedAt}</span></div>}
        </div>
      </div><br/><br/>
     <center><span class="note">Stake the tokens to get the reward of 10% tokens for every 5 minutes <br/>Reward will be added after tokens are unstaked</span></center> 
      <div className="inner" >
              <div className="Productitem">
              <div className="productbody">
                <p>BUY TOKENS</p>
                <form class="form-group"  onSubmit={BuyHandler}>
                  <input type="text" class="form-control" placeholder='Enter amount of Tokens' id="tokens1" required/><br/>
                  <input type="submit" value={"SUBMIT"} class="btn btn-secondary"/><br/>
                </form>
                <span>{TranStatusPurachse}</span>
              </div>
            </div>
            <div className="Productitem">
              <div className="productbody">
                <p>STAKE TOKENS</p>
              <form class="form-group" onSubmit={StakeHandler}>
                  <input type="text" class="form-control" placeholder='Enter amount of Tokens' id="tokens2" required/><br/>
                  <input type="submit" value={"SUBMIT"} class="btn btn-secondary"/>
              </form>
              <span>{TranStatusSTAKE}</span>
              </div>
            </div>
            <div className="Productitem">
              <div className="productbody">
              <p>UNSTAKE TOKENS</p>
              <form class="form-group" onSubmit={UnStakeHandler}>
                  <input type="text" class="form-control" placeholder='Enter amount of Tokens' id="tokens3" required/><br/>
                  <input type="submit" value={"GET"} class="btn btn-secondary"/>
                </form>
                <span>{TranStatusUNSTAKE}</span>
              </div>
            </div>
        </div>
      </div> <br/>
     <center> <button onClick={()=>props.setTrigger(false)} class="btn btn-danger">CLOSE</button></center>
    </div>
  ):"";
};
export default (TokenStaking);