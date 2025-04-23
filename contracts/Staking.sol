// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    IERC20 public rewardToken;
    uint256 public rewardRate; // tokens per second

    struct Stake {
        uint256 amount;
        uint256 lastUpdated;
        uint256 rewardDebt;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _token, uint256 _rewardRate) {
        rewardToken = IERC20(_token);
        rewardRate = _rewardRate;
    }

    function stake(uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");

        updateReward(msg.sender);
        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].lastUpdated = block.timestamp;

        require(rewardToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        emit Staked(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");
        require(stakes[msg.sender].amount >= _amount, "Insufficient staked");

        updateReward(msg.sender);
        stakes[msg.sender].amount -= _amount;

        require(rewardToken.transfer(msg.sender, _amount), "Transfer failed");
        emit Withdrawn(msg.sender, _amount);
    }

    function claimReward() external {
        updateReward(msg.sender);

        uint256 reward = stakes[msg.sender].rewardDebt;
        require(reward > 0, "No reward");
        stakes[msg.sender].rewardDebt = 0;

        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
        emit RewardClaimed(msg.sender, reward);
    }

    function updateReward(address _user) internal {
        Stake storage stakeData = stakes[_user];
        if (stakeData.amount > 0) {
            uint256 duration = block.timestamp - stakeData.lastUpdated;
            uint256 pendingCalculated = duration * rewardRate * stakeData.amount / 1e18;
            stakeData.rewardDebt += pendingCalculated;
        }
        stakeData.lastUpdated = block.timestamp;
    }

    function stakedAmount(address _user) external view returns (uint256) {
        return stakes[_user].amount;
    }

    function pendingReward(address _user) external view returns (uint256) {
        Stake memory stakeData = stakes[_user];
        if (stakeData.amount == 0) return stakeData.rewardDebt;
        uint256 duration = block.timestamp - stakeData.lastUpdated;
        uint256 pendingCalculated = duration * rewardRate * stakeData.amount / 1e18;
        return stakeData.rewardDebt + pendingCalculated;
    }
}
