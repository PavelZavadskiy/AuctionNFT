const ethers = require('ethers');
const truffleAssert = require('truffle-assertions');
const BN = require('bn.js');

const { expectRevert, time } = require('@openzeppelin/test-helpers');

const lotId = 11;
const startBid = 10;
const minBid = 100;
const caption = "Old rabbit";
const info = "Picture old rabbit.";// Description.
const endBlock = 100; 
const lotNftId = new BN('12');       
const lotNftId_1 = new BN('13');              

const Token20 = artifacts.require("CERC20");
const Token721 = artifacts.require("CERC721");

let LotStorage = artifacts.require("LotStorage.sol"); 

contract("LotStorage", async accounts =>{

    let lotStorageContract;

    let token20;
    let token721;

    let idLotNFT;

    before(  async () => {

        console.log( "Init token ERC20:" );
        token20 = await Token20.new(); 
        await token20.mint(accounts[1], new BN('1000000000000000000'));
        console.log( `Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}` );
        await token20.mint(accounts[2], new BN('1000000000000000000'));
        console.log( `Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}` );

        lotStorageContract = await LotStorage.new(token20.address);
        console.log( `Contract address: ${lotStorageContract.address}` );

        console.log( "Init token ERC721:" );
        token721 = await Token721.new();
        await token721.mint(accounts[0], lotNftId);
        console.log( `Token 721 address: ${token721.address}` );
        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
        console.log( `Accounts[0] address: ${accounts[0]}` );

        console.log( "Approve token ERC721:" );
        await token721.approve(lotStorageContract.address, lotNftId);
        let approveAddress = await token721.getApproved(lotNftId);
        console.log( `Approved address: ${approveAddress} \n` );
       
        //await lotStorageContract.configAuction(token20.address);       
    } );

    it("-> addNewLot(): Add new lot. Successful", async () => {
 
        console.log( `Owner token721: ${await token721.ownerOf(lotNftId)}` );
        let resAddNewLot = await lotStorageContract.addNewLot(startBid, minBid, ethers.utils.formatBytes32String(caption), 
                                                          ethers.utils.formatBytes32String(info), endBlock, lotNftId, token721.address, 
                                                          {from: accounts[0]});

        console.log( `Owner token721: ${await token721.ownerOf(lotNftId)}` );

        truffleAssert.eventEmitted(resAddNewLot, 'AddNewLot', (ev) => {
            
            console.log(`Result event AddNewLot :\n id = ${new BN(ev.inLotId)},\n inSeller = ${ev.inSeller},\n inStartBid = ${new BN(ev.inStartBid)},\n inMinBid = ${new BN(ev.inMinBid)},\n inCaption = ${ev.inCaption},\n inInfo = ${ev.inInfo},\n inEndBlock = ${new BN(ev.inEndBlock)},\n inTokenId = ${new BN(ev.inTokenId)},\n inToken = ${ev.inToken}\n`);
            idLotNFT = new BN(ev.inLotId);
            return true;
        });

        let countLots = await lotStorageContract.getCountOfLots();
        console.log(`getCountOfLots returned ${countLots}`);

    });

    it("-> addBid(): Add a new bid. Successful", async () => {

        console.log( `Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );

        //console.log( "Approve token ERC20:" );
        await token20.approve(lotStorageContract.address, new BN('1000000000000000000'), {from: accounts[1]});

        let resAddBid = await lotStorageContract.addBid( idLotNFT, new BN('100000000000000000'), {from: accounts[1]});

        truffleAssert.eventEmitted(resAddBid, 'AddBid', (ev) => {
            console.log(`Result event AddBid :\n id = ${new BN(ev.inIdLot)},\n inBuyer = ${ev.inBuyer},\n inBid = ${new BN(ev.inBid)}\n`);
                return true;
        });

        console.log( `Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
    });

    it( "-> refundLot(): Refund lot. Error. Has bid", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
        
        let resRefundLot = await lotStorageContract.refundLot( idLotNFT, {from: accounts[0]});

        truffleAssert.eventEmitted(resRefundLot, 'RefundLot', (ev) => {
            console.log(`RefundLot :\n inIdLot = ${new BN(ev.inIdLot)}, inBuyer = ${ev.inBuyer}, inIdToken = ${ev.inIdToken}\n`);
                return true;
        });

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
    } );

    it("-> addBid(): Add a new bid. Error. The new bid is less than the current one.", async () => {

        console.log( `Balance accounts[1]: ${accounts[2]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );

        //console.log( "Approve token ERC20:" );
        await token20.approve(lotStorageContract.address, new BN('90000000000000000'), {from: accounts[2]});

        let resAddBid = await lotStorageContract.addBid( idLotNFT, new BN('90000000000000000'), {from: accounts[2]});

        truffleAssert.eventEmitted(resAddBid, 'AddBid', (ev) => {
            console.log(`Result event AddBid :\n id = ${new BN(ev.inIdLot)},\n inBuyer = ${ev.inBuyer},\n inBid = ${new BN(ev.inBid)}\n`);
                return true;
        });

        console.log( `Balance accounts[1]: ${accounts[2]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
    });

    it("-> addBid(): Add a new bid. Successful. The new bid is more than the current one.", async () => {

        console.log( `Balance accounts[1]: ${accounts[2]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );

        //console.log( "Approve token ERC20:" );
        await token20.approve(lotStorageContract.address, new BN('1000000000000000000'), {from: accounts[2]});

        //let estimatedGas = await lotStorageContract.addBid.estimateGas( idLotNFT, new BN('1100'), {from: accounts[2]});
        //console.log( `Estimate Gas begin: ${estimatedGas}` );

        let resAddBid = await lotStorageContract.addBid( idLotNFT, new BN('110000000000000000'), {from: accounts[2]});

        truffleAssert.eventEmitted(resAddBid, 'AddBid', (ev) => {
            console.log(`Result event AddBid :\n id = ${new BN(ev.inIdLot)},\n inBuyer = ${ev.inBuyer},\n inBid = ${new BN(ev.inBid)}\n`);
                return true;
        });

        console.log( `Balance accounts[1]: ${accounts[2]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
    });

    it( "-> claimLot(): Claim lot. Error. Time has not expired", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);
        
        let resclaimLot = await lotStorageContract.claimLot( idLotNFT, {from: accounts[2]});

        truffleAssert.eventEmitted(resclaimLot, 'ClaimLot', (ev) => {
            console.log(`Result event ClaimLot :\n inIdLot = ${new BN(ev.inIdLot)}, inBuyer = ${ev.inBuyer}, inIdToken = ${ev.inIdToken}\n`);
                return true;
        });

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
    } );

    it( "-> claimPayment(): Claim payment. Error. Time has not expired", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Balance accounts[0]: ${accounts[1]} = ${await token20.balanceOf(accounts[0])}` );
        
        let resclaimPayment = await lotStorageContract.claimPayment( idLotNFT, {from: accounts[0]});

        truffleAssert.eventEmitted(resclaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n inIdLot = ${new BN(ev.inIdLot)}, inSeller = ${ev.inSeller}, inIdToken = ${new BN(ev.inPayment)}\n`);
                return true;
        });

        console.log( `Balance accounts[0]: ${accounts[1]} = ${await token20.balanceOf(accounts[0])}` );
    } );

    it("-> addBid(): Add a new bid. Error. Time over", async () => {
        
        await time.advanceBlockTo('310');
        current = current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);
     
        console.log( `Balance accounts[1]: ${accounts[2]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );

        //console.log( "Approve token ERC20:" );
        await token20.approve(lotStorageContract.address, new BN('1000000000000000000'), {from: accounts[2]});

        let resAddBid = await lotStorageContract.addBid( idLotNFT, new BN('120000000000000000'), {from: accounts[2]});

        truffleAssert.eventEmitted(resAddBid, 'AddBid', (ev) => {
            console.log(`Result event AddBid :\n id = ${new BN(ev.inIdLot)},\n inBuyer = ${ev.inBuyer},\n inBid = ${new BN(ev.inBid)}\n`);
                return true;
        });

        console.log( `Balance accounts[1]: ${accounts[2]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance accounts[2]: ${accounts[2]} = ${await token20.balanceOf(accounts[2])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
    });

    it( "-> claimLot(): Claim lot. Error. Is not the owner of the lot", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `-> Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
        
        let resclaimLot = await lotStorageContract.claimLot( idLotNFT, {from: accounts[1]});

        truffleAssert.eventEmitted(resclaimLot, 'ClaimLot', (ev) => {
            console.log(`Result event ClaimLot :\n inIdLot = ${new BN(ev.inIdLot)}, inBuyer = ${ev.inBuyer}, inIdToken = ${ev.inIdToken}\n`);
                return true;
        });

        console.log( `-> Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
    } );

    it( "-> claimLot(): Claim lot. Successful", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
        
        let resclaimLot = await lotStorageContract.claimLot( idLotNFT, {from: accounts[2]});

        truffleAssert.eventEmitted(resclaimLot, 'ClaimLot', (ev) => {
            console.log(`Result event ClaimLot :\n inIdLot = ${new BN(ev.inIdLot)}, inBuyer = ${ev.inBuyer}, inIdToken = ${ev.inIdToken}\n`);
                return true;
        });

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
    } );

    it( "-> claimLot(): Claim lot. Error. Repeated lot request", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId)}` );
        
        let resclaimLot = await lotStorageContract.claimLot( idLotNFT, {from: accounts[2]});

        truffleAssert.eventEmitted(resclaimLot, 'ClaimLot', (ev) => {
            console.log(`Result event ClaimLot :\n inIdLot = ${new BN(ev.inIdLot)}, inBuyer = ${ev.inBuyer}, inIdToken = ${ev.inIdToken}\n`);
                return true;
        });

        console.log( `-> Owner token721 address: ${await token721.ownerOf(lotNftId)}` );

    } );

    it( "-> claimPayment(): Claim payment. Error. Is not the seller of the lot", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}` );
        
        let resclaimPayment = await lotStorageContract.claimPayment( idLotNFT, {from: accounts[1]});

        truffleAssert.eventEmitted(resclaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n inIdLot = ${new BN(ev.inIdLot)}, inSeller = ${ev.inSeller}, inIdToken = ${new BN(ev.inPayment)}\n`);
                return true;
        });

        console.log( `Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}` );
    } );

    it( "-> claimPayment(): Claim payment. Successful", async () => {
        
        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
        
        let resclaimPayment = await lotStorageContract.claimPayment( idLotNFT, {from: accounts[0]});

        truffleAssert.eventEmitted(resclaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n inIdLot = ${new BN(ev.inIdLot)}, inSeller = ${ev.inSeller}, inIdToken = ${new BN(ev.inPayment)}\n`);
                return true;
        });

        console.log( `Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
    } );

    it( "-> claimPayment(): Claim payment. Error. Repeated lot request", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
        
        let resclaimPayment = await lotStorageContract.claimPayment( idLotNFT, {from: accounts[0]});

        truffleAssert.eventEmitted(resclaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n inIdLot = ${new BN(ev.inIdLot)}, inSeller = ${ev.inSeller}, inIdToken = ${new BN(ev.inPayment)}\n`);
                return true;
        });

        console.log( `Balance accounts[0]: ${accounts[0]} = ${await token20.balanceOf(accounts[0])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
    } );

    it("-> addNewLot(): Add new lot. Successful", async () => {
 
        await token721.mint(accounts[1], lotNftId_1);
        console.log( `Token 721 address: ${token721.address}` );
        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId_1)}` );
        console.log( `Accounts[1] address: ${accounts[1]}` );

        console.log( "Approve token ERC721:" );
        await token721.approve(lotStorageContract.address, lotNftId_1, {from: accounts[1]});
        let approveAddress = await token721.getApproved(lotNftId_1);
        console.log( `Approved address: ${approveAddress} \n` );

        let current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId_1)}` );
        let resAddNewLot = await lotStorageContract.addNewLot(startBid, minBid, ethers.utils.formatBytes32String(caption), 
                                                          ethers.utils.formatBytes32String(info), current+100, lotNftId_1, token721.address, 
                                                          {from: accounts[1]});

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId_1)}` );

        console.log( "Added lot:" );
        truffleAssert.eventEmitted(resAddNewLot, 'AddNewLot', (ev) => {
            
            console.log(`Result event AddNewLot :\n id = ${new BN(ev.inLotId)},\n inSeller = ${ev.inSeller},\n inStartBid = ${new BN(ev.inStartBid)},\n inMinBid = ${new BN(ev.inMinBid)},\n inCaption = ${ev.inCaption},\n inInfo = ${ev.inInfo},\n inEndBlock = ${new BN(ev.inEndBlock)},\n inTokenId = ${new BN(ev.inTokenId)},\n inToken = ${ev.inToken}\n`);
            idLotNFT = new BN(ev.inLotId);
            return true;
        });

        let countLots = await lotStorageContract.getCountOfLots();
        console.log(`getCountOfLots returned ${countLots}`);
    });

    it( "-> claimPayment(): Claim payment. Error. No bids", async () => {

        let current = await time.latestBlock();

        //await time.advanceBlockTo(current+150);
        //current = current = await time.latestBlock();
        //console.log(`Current after block: ${current}`);

        current = await time.latestBlock();
        console.log(`Current block: ${current}`);

        console.log( `Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
        
        let resclaimPayment = await lotStorageContract.claimPayment( idLotNFT, {from: accounts[1]});

        truffleAssert.eventEmitted(resclaimPayment, 'ClaimPayment', (ev) => {
            console.log(`Result event ClaimPayment :\n inIdLot = ${new BN(ev.inIdLot)}, inSeller = ${ev.inSeller}, inIdToken = ${new BN(ev.inPayment)}\n`);
                return true;
        });

        console.log( `Balance accounts[1]: ${accounts[1]} = ${await token20.balanceOf(accounts[1])}` );
        console.log( `Balance contract: ${lotStorageContract.address} = ${await token20.balanceOf(lotStorageContract.address)}` );
    } );

    it( "-> refundLot(). Refund lot. Successful", async () => {

        let current = await time.latestBlock();
        console.log(`Current block: ${current}; ended block: ${endBlock}`);

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId_1)}` );
        
        //let estimatedGas = await lotStorageContract.refundLot.estimateGas(idLotNFT, {from: accounts[1]});
        //console.log( `Estimate Gas begin: ${estimatedGas}` );

        let resRefundLot = await lotStorageContract.refundLot( idLotNFT, {from: accounts[1]});

        truffleAssert.eventEmitted(resRefundLot, 'RefundLot', (ev) => {
            console.log(`Result event RefundLot :\n inIdLot = ${new BN(ev.inIdLot)}, inBuyer = ${ev.inBuyer}, inIdToken = ${ev.inIdToken}\n`);
                return true;
        });

        //console.log( `Current Gas end: ${msg.gas}` );

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId_1)}` );
    } );

    it( "-> refundLot(). Refund lot. Error. Repeated lot request", async () => {

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId_1)}` );
        
        let resRefundLot = await lotStorageContract.refundLot( idLotNFT, {from: accounts[1]});

        truffleAssert.eventEmitted(resRefundLot, 'RefundLot', (ev) => {
            console.log(`Result event RefundLot :\n inIdLot = ${new BN(ev.inIdLot)}, inBuyer = ${ev.inBuyer}, inIdToken = ${ev.inIdToken}\n`);
                return true;
        });

        console.log( `Owner token721 address: ${await token721.ownerOf(lotNftId_1)}` );
    } );

});