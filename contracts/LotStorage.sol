pragma solidity ^0.8.0;

import "./Lot.sol";
import "./NFTToken.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LotStorage is Lot {

    using SafeERC20 for IERC20;

    IERC20 private tokenERC20;    

    SLot[] private lotStorage;
    //mapping(uint => SBid[]) private bidStorage; //Without this functionality we save 46977 gas

    event AddNewLot(
                    uint inLotId, 
                    address inSeller, 
                    uint inStartBid, 
                    uint inMinBid, 
                    bytes32 inCaption, 
                    bytes32 inInfo, 
                    uint inEndBlock, 
                    uint inTokenId,
                    IERC721 inToken
                    );
    event AddBid(uint inIdLot, address inBuyer, uint inBid);
    event ClaimLot(uint inIdLot, address inBuyer, uint inIdToken);
    event RefundLot(uint inIdLot, address inBuyer, uint inIdToken);
    event ClaimPayment(uint inIdLot, address inSeller, uint inPayment);

    constructor(IERC20 inTokenERC20){
        tokenERC20 = inTokenERC20;
    }

    event Token721Owner(address owner);

    function addNewLot(
                        uint inStartBid, 
                        uint inMinBid, 
                        bytes32 inCaption, 
                        bytes32 inInfo, 
                        uint inEndBlock, 
                        uint inTokenId, 
                        IERC721 inToken 
                        ) public {
        
        require(address(msg.sender) != address(0), "addNewLot: buyer with null address!");
        
        uint id = lotStorage.length;
        lotStorage.push(createLot(inStartBid, inMinBid, msg.sender, inCaption, inInfo, inEndBlock, inTokenId, inToken));

        inToken.transferFrom(msg.sender, address(this), inTokenId);
        
        emit AddNewLot(id, msg.sender, inStartBid, inMinBid, inCaption, inInfo, inEndBlock, inTokenId, inToken);
    }

    function getCountOfLots() public view returns(uint){
        return lotStorage.length;
    }

    function addBid(uint inIdLot, uint inBid) public {
        SLot storage lot = lotStorage[inIdLot]; // difference in used gas 131401 - 126959 = 4442
        require(address(msg.sender) != address(0), "addBid: buyer with null address!");
        require(inBid>lot.currentBid , "addBid: bid is too small!");
        require(lot.endBlock>block.number, "addBid: auction ended!");

        address previousBuyer = lot.buyer;
        uint previousBid = lot.currentBid;

        //Change bid and buyer in lot
        lot.currentBid = inBid;
        lot.buyer = msg.sender;

        //Save bid in storage
        //bidStorage[inIdLot].push(SBid(msg.sender,inBid)); //Without this functionality we save 46977 gas

        //Return bid to the previous buyer
        if(previousBuyer != address(0)){
           tokenERC20.safeTransfer(previousBuyer, previousBid);
        }

        //Get tokens from buyer
        tokenERC20.safeTransferFrom(msg.sender, address(this), inBid);

        emit AddBid(inIdLot, msg.sender, inBid);
    }

    function claimLot(uint inIdLot) public{
        SLot storage lot = lotStorage[inIdLot];
        require(lot.buyer == msg.sender, "claimLot: it's not your won lot!");
        require(lot.endBlock<block.number, "claimLot: auction not ended!");
        require(lot.isClaimLot, "claimLot: lot was taken!");

        lot.isClaimLot = false;

        lot.token.safeTransferFrom(address(this), msg.sender, lot.tokenId);
  
        emit ClaimLot(inIdLot, msg.sender, lot.tokenId);
    }

    function refundLot(uint inIdLot) public{
        SLot storage lot = lotStorage[inIdLot]; // difference in used gas 87976 - 82643 = 5333
        require(address(msg.sender) != address(0), "refundLot: seller with null address!");
        require(lot.seller == msg.sender, "refundLot: it's not your lot!");
        require(lot.buyer == address(0), "refundLot: lot has bid!");
        //require(lotStorage[inIdLot].endBlock<block.number, "refundLot: auction not ended!");
        require(lot.isClaimLot, "refundLot: lot was taken!");

        lot.isClaimLot = false;

        lot.token.safeTransferFrom(address(this), msg.sender, lot.tokenId);

        emit RefundLot(inIdLot, msg.sender, lot.tokenId);
    }

    function claimPayment(uint inIdLot) public{
        SLot storage lot = lotStorage[inIdLot];
        require(lotStorage.length >= inIdLot, "claimPayment: wrong lot id!");
        require(lot.seller == msg.sender, "claimPayment: it's not your lot!");
        require(lot.endBlock < block.number, "claimPayment: auction not ended!");
        require(lot.startBid != lot.currentBid, "claimPayment: start bid == current bid!");
        require(lot.isClaimPayment, "claimPayment: payment was taken!");

        lot.isClaimPayment = false;
      
        tokenERC20.safeTransfer(msg.sender, lot.currentBid);

        emit ClaimPayment(inIdLot, msg.sender, lot.currentBid);
    }
}