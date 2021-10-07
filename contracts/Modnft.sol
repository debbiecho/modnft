// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Modnft is ERC721, Ownable {

    uint public nftCounter;
    uint public nftCap;
    uint public weiPrice;

    mapping(address=>uint) public whitelist;

    event minted(address indexed to, uint id);

    constructor () ERC721 ("Mines of Dalarnia NFT TEST", "TMOD") Ownable(){
        nftCounter = 0;
        nftCap = 2000;
        weiPrice = 10000000000;
    }

    function changeNftCap(uint256 _nftCap) public onlyOwner () {
        require(_nftCap >= nftCounter, "Cannot set cap to less than already minted");
        nftCap = _nftCap;
    }

    function changePrice(uint256 _weiPrice) public onlyOwner () {
        weiPrice = _weiPrice;
    }

    function addToWhitelist(address[] memory _users) public onlyOwner (){
        uint length = _users.length;
        for (uint i; i < length; i++){
            if(whitelist[_users[i]] != 2){
                whitelist[_users[i]] = 1;
            }
        }
    }

    function mintWhitelist() public {
        require(whitelist[msg.sender] == 1, "Address is not whitelisted.");
        require(nftCounter < nftCap, "Nft cap reached.");
        uint256 newItemId = nftCounter;
        nftCounter += nftCounter;
        whitelist[msg.sender] = 2;

        _safeMint(msg.sender, newItemId);
        emit minted(msg.sender, newItemId);
    } 

    function mint(uint256 _nr_to_mint) public payable {
        require(_nr_to_mint >= 1 && _nr_to_mint <= 3, "Can not mint more nfts than 3 per tx.");
        require(msg.value == (weiPrice * _nr_to_mint), "Wrong ETH amount.");
        require((nftCounter + _nr_to_mint) <= nftCap, "Nft cap reached.");

        uint256 target = nftCounter + _nr_to_mint;
        uint256 i = nftCounter;

        payable(owner()).transfer(msg.value);

        for (i ; i < target; i++){
            uint256 newItemId = i;
            nftCounter = i + 1;
            _safeMint(msg.sender, newItemId);
            emit minted(msg.sender, newItemId);
        }
    }
}