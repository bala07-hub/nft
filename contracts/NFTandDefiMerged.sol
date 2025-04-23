// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./Defi.sol";
import "./Tweets.sol";
import "./Staking.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./interfaces/IStaking.sol"; 

interface IPrivateAirdrop {
    function hasClaimed(address user) external view returns (bool);
}




contract NFTandDefiMerged is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private ProductID;

    Defi public DefiInstance;
    Tweets public TweetInstance;
    IPrivateAirdrop public AirdropInstance;
    IStaking public StakingInstance;


    address payable owner;

    uint256 ProductPrice = 0.01 ether;

    struct ProductProperties {
        uint256 ProductId;
        string ProductURI;
        address payable owner;
        address payable seller;
        uint256 price;
        bool status;
        string ProductName;
        uint ERTNPrice;
        uint resaleCount;
        address originalMinter;
    }

    mapping(uint256 => ProductProperties) private PRODUCTS;

    constructor(
    address DefContractAddress,
    address TweetContractAddress,
    address AirdropContractAddress,
    address StakingContractAddress
) ERC721("NFTMarketPlace", "NFTM") {
    owner = payable(msg.sender);
    DefiInstance = Defi(DefContractAddress);
    TweetInstance = Tweets(TweetContractAddress);
    AirdropInstance = IPrivateAirdrop(AirdropContractAddress);
    StakingInstance = IStaking(StakingContractAddress); // Correct casting
}


    function MintProduct(
    string memory ProductURI,
    uint256 price,
    string memory name,
    uint ertnprice,
    address pubkey,
    bool postPic
)
 public payable {
    require(price > 0, "Price can't be negative");
   // require(
     //   AirdropInstance.hasClaimed(msg.sender),
       // "You must claim the airdrop to mint"
   // );

    // Check if the user is a premium staker
   uint staked = StakingInstance.stakedAmount(msg.sender);



    bool isPremiumStaker = staked >= 100 * 10**18;

    ProductID.increment();
    uint256 currentProductid = ProductID.current();

    _safeMint(msg.sender, currentProductid);
    _setTokenURI(currentProductid, ProductURI);

    PRODUCTS[currentProductid] = ProductProperties({
        ProductId: currentProductid,
        ProductURI: ProductURI,
        owner: payable(address(this)),
        seller: payable(msg.sender),
        price: price,
        status: true,
        ProductName: name,
        ERTNPrice: ertnprice,
        resaleCount: 0,
        originalMinter: payable(msg.sender)
    });

    _transfer(msg.sender, address(this), currentProductid);

    if (postPic) {
        if (isPremiumStaker) {
            PostText(name, ProductURI, pubkey); // No payment required
        } else {
            require(msg.value > 0, "Please pay 1 Gwei to share on feed");
            PostText(name, ProductURI, pubkey); // Enforce payment
        }
    }
}

    function SaleProduct(uint Productid) public payable {
        uint price = PRODUCTS[Productid].price;
        address payable seller = PRODUCTS[Productid].seller;
        address payable originalMinter = payable(PRODUCTS[Productid].originalMinter);

        require(msg.value >= price, "Insufficient ETH sent");

        PRODUCTS[Productid].status = false;
        PRODUCTS[Productid].seller = payable(msg.sender);
        PRODUCTS[Productid].owner = payable(msg.sender);
        PRODUCTS[Productid].resaleCount += 1;

        _transfer(address(this), msg.sender, Productid);
        approve(address(this), Productid);

        uint royalty = (price * 5) / 100;
        uint sellerAmount = price - royalty;

        if (royalty > 0) {
            originalMinter.transfer(royalty);
        }
        seller.transfer(sellerAmount);
    }

    function Resale(uint productid,uint256 price,uint ERTNPrice)public payable{
        PRODUCTS[productid].status = true;
        PRODUCTS[productid].owner = payable(address(this));
        PRODUCTS[productid].seller=payable(msg.sender);
        PRODUCTS[productid].price = price;
        PRODUCTS[productid].ERTNPrice= ERTNPrice;
        _transfer(msg.sender,address(this),productid);
    }

    function BuyProducts(uint256[] memory productIds) public payable{
        for(uint i=0;i<productIds.length;i++){
            SaleProduct(productIds[i]);
        }
        payable(owner).transfer(msg.value);
    }

    function SaleProductERTN(uint Productid) public payable {
        uint price = PRODUCTS[Productid].ERTNPrice;
        require(DefiInstance.checkbalance(msg.sender) >= price, "Not enough ERTN");

        address seller = PRODUCTS[Productid].seller;
        address originalMinter = PRODUCTS[Productid].originalMinter;

        PRODUCTS[Productid].status = false;
        PRODUCTS[Productid].seller = payable(msg.sender);
        PRODUCTS[Productid].owner = payable(msg.sender);
        PRODUCTS[Productid].resaleCount += 1;

        _transfer(address(this), msg.sender, Productid);
        approve(address(this), Productid);

        uint royalty = (price * 5) / 100;
        uint sellerAmount = price - royalty;

        if (royalty > 0) {
            DefiInstance.transferERTN(msg.sender, originalMinter, royalty);
        }
        DefiInstance.transferERTN(msg.sender, seller, sellerAmount);
    }

    function BuyProductsERTN(uint256[] memory productIds) public payable{
        for(uint i=0;i<productIds.length;i++){
            SaleProductERTN(productIds[i]);
        }
        payable(owner).transfer(msg.value);
    }

    function GetAllProducts() public view returns(ProductProperties[] memory){
        uint TotalProducts = ProductID.current();
        ProductProperties[] memory AllProductsArray = new ProductProperties[](TotalProducts);

        uint CIndex = 0;

        for(uint i=0;i<TotalProducts;i++){
            uint CId= i + 1;
            ProductProperties storage Item = PRODUCTS[CId];
            AllProductsArray[CIndex] = Item;
            CIndex=CIndex+1;
        }
        return AllProductsArray;
    }

    function getMyProducts() public view returns(ProductProperties[] memory){
        uint TotalProducts = ProductID.current();
        uint UserProductCount;
        uint CurrentIndex = 0;
        for(uint i=0;i<TotalProducts;i++){
            if(PRODUCTS[i+1].owner == msg.sender || PRODUCTS[i+1].seller == msg.sender){
                UserProductCount = UserProductCount+1;
            }
        }
        ProductProperties[] memory UserProducts = new ProductProperties[](UserProductCount);
        for(uint i=0;i<UserProductCount;i++){
            if(PRODUCTS[i+1].owner == msg.sender || PRODUCTS[i+1].seller == msg.sender){
                uint CId = i+1;
                ProductProperties storage CItem = PRODUCTS[CId];
                UserProducts[CurrentIndex] = CItem;
                CurrentIndex = CurrentIndex + 1;
            }
        }
        return UserProducts;
    }

    function checkbalance(address pukey) public view returns(uint){
        return DefiInstance.checkbalance(pukey);
    }

    function BuyTokens(uint256 amount,address pubkey) external {
        DefiInstance.BuyTokens(amount,pubkey);
    }

    function StakeTokens(uint256 amount,address pubkey) external {
        DefiInstance.StakeTokens(amount,pubkey);
    }

    function UnstakeTokens(uint256 amount,address pubkey) external {
        DefiInstance.UnstakeTokens(amount,pubkey);
    }

    function RewardCalculater(address staker,uint256 amount) public view returns (uint256) {
        return DefiInstance.RewardCalculater(staker,amount);
    }

    function Stakedamount(address staker) public view returns(uint){
        return DefiInstance.Stakedamount(staker);
    }

    function Stakedtime(address staker) public view returns(uint){
        return DefiInstance.Stakedtime(staker);
    }

    function Login(address UserKey , string memory pw) public view returns(bool){
        return TweetInstance.Login(UserKey,pw);
    }

    function SignUp(string memory FirstName,string memory LastName,string memory Profile,address userKey,string memory password) public payable{
        require(msg.value > 0,"please pay 1 Gwi");
        TweetInstance.SignUp(FirstName, LastName, Profile, userKey, password);
    }

    function PostText(string memory Data,string memory NFTUrl,address pubkey) public payable{
        require(msg.value > 0,"please pay 1 Gwi");
        TweetInstance.PostText(Data,NFTUrl,pubkey);
    }

    function DeletingText(address pubkey,uint index)public{
        TweetInstance.DeletingText(pubkey, index);
    }

    function GetTextData() public view returns(Tweets.textfeed[] memory){
        return TweetInstance.GetTextData();
    }

    function GetUserData(address pubkey) public view returns(Tweets.User memory) {
        return TweetInstance.GetUserData(pubkey);
    }

    function setStakingContract(address stakingAddress) public {
    require(msg.sender == owner, "Only owner can set staking contract");
    StakingInstance = IStaking(stakingAddress);
}

}