pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CERC20 is ERC20("AuctionToken", "AUT") {
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract CERC721 is ERC721("AuctionTokenNFT", "NFT") {
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}

