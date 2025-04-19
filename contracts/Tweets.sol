// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
contract Tweets{
    struct User{
        string FName;
        string LName;
        string profilePic;
        address owner;
        uint timestamp;
        string password;
        string[] Text;
    }
    User[] public Users;
    
    struct textfeed{
        string Profile;
        string Fname;
        string Lname;
        uint timestamp;
        string text;
        address owner;
        string NFTUrl;

    }
    textfeed[] public GlobaltextFeed;
    
    function Login(address userKey,string memory password) public view returns(bool){
        require(checksignup(userKey),"User Not Found");
        for(uint i=0;i<Users.length;i++){
            if(Users[i].owner == userKey && keccak256(abi.encodePacked(Users[i].password)) == keccak256(abi.encodePacked(password))){
                return true;
            }
        }
        return false;
    }
    function checksignup(address pubkey) public view returns(bool){
        for(uint i=0;i<Users.length;i++){
            if(Users[i].owner == pubkey){
                return true;
            }
        }
        return false;
    }
    function SignUp(
        string memory FirstName,
        string memory LastName,
        string memory Profile,
        address userKey,
        string memory password
    ) public payable {
        require(checksignup(userKey) == false, "You have already SignUp");

        string[] memory emptyArray; // ✅ Properly initialize an empty dynamic array

        Users.push(User({
            FName: FirstName,
            profilePic: Profile,
            LName: LastName,
            owner: userKey,
            timestamp: block.timestamp,
            password: password,
            Text: emptyArray
        }));
    

    

    }
    function PostText(string memory Data,string memory NFTUrl,address pubkey) public payable{
        require(checksignup(pubkey) == true,"User Not found");
        uint temp=0;
        for(uint i=0;i<Users.length;i++){
            if(pubkey == Users[i].owner){
                Users[i].Text.push(Data);  
                temp = i;
            }
        }

        GlobaltextFeed.push(textfeed(Users[temp].profilePic,Users[temp].FName,Users[temp].LName,block.timestamp,Data,pubkey,NFTUrl));        
    }
    
    function DeletingText(address pubkey,uint index)public{
        //At owner side
        uint UserIndex;
        uint textIndex;
        for(uint i=0;i<Users.length;i++){
            if(pubkey == Users[i].owner){
                UserIndex = i;
                textIndex = index;
            }
        }
        for(uint i = textIndex; i < Users[UserIndex].Text.length - 1; i++) {
            Users[UserIndex].Text[i] = Users[UserIndex].Text[i+1];
        }
        // Remove the last element
        delete Users[UserIndex].Text[Users[UserIndex].Text.length-1];
        // Decrease the length
        Users[UserIndex].Text.pop();
        // At global Data
        uint Gindex ;
        for(uint i=0;i<GlobaltextFeed.length;i++){
            if(keccak256(abi.encodePacked(Users[UserIndex].Text[textIndex]))==keccak256(abi.encodePacked(GlobaltextFeed[i].text))){
                Gindex = i;
            }
        }
        for(uint i = Gindex; i < GlobaltextFeed.length - 1; i++) {
            GlobaltextFeed[i] = GlobaltextFeed[i + 1];
        }
        // Remove the last element
        delete GlobaltextFeed[GlobaltextFeed.length - 1];
        // Decrease the length
        GlobaltextFeed.pop();
    }
    //Getting Global Text data
    function GetTextData() public view returns(textfeed[] memory){
        return GlobaltextFeed;
    }
    function GetUserData(address pubkey) public view returns(User memory){
        for(uint i=0;i<Users.length;i++){
            if(Users[i].owner == pubkey){
                return Users[i];
            }
        }
    }
}