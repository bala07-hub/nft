// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Defi is ERC20 {
    using SafeMath for uint256;

    struct Stake {
        uint256 amount;
        uint256 startTime;
    }

    mapping(address => Stake) public StakeStore;
    uint256 private constant REWARD_RATE = 10; // 10% reward rate per year
    uint256 private constant REWARD_DURATION =300 seconds; // Reward duration is 5 min

    constructor() ERC20("ERCNEWTOKEN","ERTN") {
        _mint(address(this),10000);
    }
    function checkbalance(address pukey) public view returns(uint){
        return balanceOf(pukey);
    }
    function BuyTokens(uint256 amount,address pubkey) external {
        require(checkbalance(address(this))>amount,"Tokens are soldout");
        _transfer(address(this),pubkey,amount);
    }

    function StakeTokens(uint256 amount,address pubkey) external {
        require(amount > 0, "Amount must be greater than zero");
        require(StakeStore[pubkey].amount == 0, "Cannot stake while already staking");

        _transfer(pubkey, address(this), amount);

        StakeStore[pubkey] = Stake(amount, block.timestamp);
    }

    function UnstakeTokens(uint256 amount,address pubkey) external {
        require(StakeStore[pubkey].amount > 0, "No stake found");

        uint256 reward = RewardCalculater(pubkey,amount);

        uint256 TotalUnstaked_Tokens = amount.add(reward);
        
        require(TotalUnstaked_Tokens <= balanceOf(address(this)), "Insufficient balance in the contract");

        if(StakeStore[pubkey].amount == amount){
            delete StakeStore[pubkey];
        }
        else{
            StakeStore[pubkey].amount = StakeStore[pubkey].amount - amount;
        }
        _transfer(address(this), pubkey, TotalUnstaked_Tokens);
    }

    function RewardCalculater(address staker,uint256 amount) public view returns (uint256) {
        Stake storage userStake = StakeStore[staker];
        require(userStake.amount > 0, "No stake found");
         uint256 stakingDuration = block.timestamp.sub(userStake.startTime);
        uint256 reward = amount.mul(stakingDuration).mul(REWARD_RATE).div(REWARD_DURATION).div(100);
        return reward;

    }

    function Stakedamount(address staker) public view returns(uint){
        return StakeStore[staker].amount;
    }
    function Stakedtime(address staker) public view returns(uint){
        return StakeStore[staker].startTime;
    }
    function transferERTN(address fromAdd, address toAdd , uint amount) public{
        _transfer(fromAdd, toAdd, amount);
    }
}

