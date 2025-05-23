// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IPlonkVerifier {
    function verifyProof(bytes memory proof, uint[] memory pubSignals) external view returns (bool);
}

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/// @title Airdrop contract using zk-SNARK proof for eligibility + tracks claimed status
contract PrivateAirdrop is Ownable {
    IERC20 public immutable airdropToken;
    IPlonkVerifier immutable verifier;
    uint public immutable amountPerRedemption;

    uint256 constant SNARK_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    bytes32 public root;

    mapping(bytes32 => bool) public nullifierSpent;
    mapping(address => bool) public hasClaimed;

    constructor(
        IERC20 _airdropToken,
        uint _amountPerRedemption,
        IPlonkVerifier _verifier,
        bytes32 _root
    ) {
        airdropToken = _airdropToken;
        amountPerRedemption = _amountPerRedemption;
        verifier = _verifier;
        root = _root;
    }

    /// @notice Claim airdrop using a valid zk-proof
   function collectAirdrop(bytes calldata proof, bytes32 nullifierHash) public {
    require(uint256(nullifierHash) < SNARK_FIELD, "Nullifier is not within the field");
    require(!nullifierSpent[nullifierHash], "Airdrop already redeemed");

    uint[] memory pubSignals = new uint[](3); // Declare and initialize the array
    pubSignals[0] = uint256(root);
    pubSignals[1] = uint256(nullifierHash);
    pubSignals[2] = uint256(uint160(msg.sender));

    require(verifier.verifyProof(proof, pubSignals), "Proof verification failed");

    nullifierSpent[nullifierHash] = true;
    airdropToken.transfer(msg.sender, amountPerRedemption);
}


    /// @notice Check if user has already claimed the drop
    function claimed(address user) external view returns (bool) {
        return hasClaimed[user];
    }

    /// @notice Owner can update the Merkle root
    function updateRoot(bytes32 newRoot) public onlyOwner {
        root = newRoot;
    }
}
