pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//Благодаря ERC20 нам нет необходимости описывать свою реализацию интерфейса IERC20
// totalSupply balanceOf transfer transferFrom approve allowance
contract CERC20 is ERC20("AuctionToken", "AUT") {
    constructor(){
        mint(msg.sender, 1000000 ether); 
    }
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract CERC721 is ERC721("AuctionTokenNFT", "NFT") {
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}

