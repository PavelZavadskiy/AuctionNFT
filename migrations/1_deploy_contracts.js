require('dotenv').config();

let LotStorage = artifacts.require("./LotStorage.sol");

module.exports = async function(deployer){
    if(deployer.network==="ropsten-fork"){

    }
    await deployer.deploy(LotStorage, process.env.ROPSTEN_INFURA_TOKEN20);
}