// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStaking {
    function stakedAmount(address _user) external view returns (uint256);
    function pendingReward(address _user) external view returns (uint256);
}
