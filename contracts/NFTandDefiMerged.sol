// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
import "./Defi.sol";
import "./Tweets.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTandDefiMerged is ERC721URIStorage{

    Defi public DefiInstance;
    Tweets public TweetInstance;

    address payable owner;

    using Counters  for Counters.Counter;
    Counters.Counter private ProductID;
    // Counters.Counter private NoOfItemSold;

    uint256 ProductPrice = 0.01 ether;

    constructor(address DefContractAddress , address TweetContractAddress) ERC721("NFTMarketPlace","NFTM"){
        owner = payable(msg.sender);
        DefiInstance= Defi(DefContractAddress);
        TweetInstance = Tweets(TweetContractAddress);
    }
    struct ProductProperties{
        uint256 ProductId;
        string ProductURI;
        address payable owner;
        address payable seller;
        uint256 price;
        bool status;
        string ProductName;
        uint ERTNPrice;
    }
    mapping(uint256 => ProductProperties) private PRODUCTS;



    function MintProduct(string memory ProductURI , uint256 price , string memory name ,uint ertnprice,address pubkey,bool postPic) public payable{
        require(price > 0 ,"Price Can't be negative");
        ProductID.increment();
        uint256 currentProductid = ProductID.current();
        
        _safeMint(msg.sender , currentProductid);

        _setTokenURI(currentProductid,ProductURI);

        PRODUCTS[currentProductid] = ProductProperties(currentProductid,ProductURI,payable(address(this)),payable(msg.sender),price,true,name,ertnprice);    
        
        _transfer(msg.sender,address(this),currentProductid);

        if(postPic == true){
            PostText(name,ProductURI,pubkey);
        }

    }
    function SaleProduct(uint Productid) public payable{
        uint price = PRODUCTS[Productid].price;
        address seller = PRODUCTS[Productid].seller;
        PRODUCTS[Productid].status = false;
        PRODUCTS[Productid].seller = payable(msg.sender);
        PRODUCTS[Productid].owner = payable(msg.sender);
        _transfer(address(this),msg.sender,Productid);
        approve(address(this),Productid);
        payable(seller).transfer(price);
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

    function SaleProductERTN(uint Productid) public payable{
        uint price = PRODUCTS[Productid].ERTNPrice;
        require(DefiInstance.checkbalance(msg.sender)>=price,"You dont have enough Tokens");
        address seller = PRODUCTS[Productid].seller;
        PRODUCTS[Productid].status = false;
        PRODUCTS[Productid].seller = payable(msg.sender);
        PRODUCTS[Productid].owner = payable(msg.sender);
        _transfer(address(this),msg.sender,Productid);
        approve(address(this),Productid);
        DefiInstance.transferERTN(msg.sender,seller,price);
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
            ProductProperties storage Item =   PRODUCTS[CId];
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
        return DefiInstance.RewardCalculater(staker,amount) ;

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
}