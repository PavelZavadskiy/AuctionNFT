pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Lot{

    struct SBid{
        address addressBuyer;
        uint bid;
    }

    struct SLot{
        uint startBid;
        uint  minBid;
        address seller;
        bytes32 caption;
        bytes32 info;  
        uint endBlock; //Использовать номер блока // Приблизительно преобразовывать номер блока во время
        uint tokenId; //unique Id token ERC721
        IERC721 token;
        uint currentBid;
        address buyer;
        bool isClaimLot;
        bool isClaimPayment;
    } 

    function createLot(
                        uint inStartBid, 
                        uint inMinBid, 
                        address inSeller, 
                        bytes32 inCaption, 
                        bytes32 inInfo, 
                        uint inEndBlock, 
                        uint inTokenId, 
                        IERC721 inToken
                        ) public pure returns(SLot memory outLot){
        require(address(inSeller) != address(0), "CreateLot: seller with null address!");
        require(inCaption.length!=0, "CreateLot: No caption!");
        require(inTokenId!=0, "CreateLot: No token Id!");
        require(inEndBlock!=0, "CreateLot: No end block!");  

        outLot.startBid = inStartBid;
        outLot.minBid = inMinBid;
        outLot.seller = inSeller;
        outLot.caption = inCaption;
        outLot.info = inInfo;
        outLot.endBlock = inEndBlock;
        outLot.tokenId = inTokenId;
        outLot.currentBid = inStartBid;
        outLot.token = inToken;
        outLot.isClaimLot = true;
        outLot.isClaimPayment = true;
        outLot.buyer = address(0);
    } 
}