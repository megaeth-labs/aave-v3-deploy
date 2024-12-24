const hre = require("hardhat");
const config = require("./deploy-config.json");
const BigNumber = require("bignumber.js");

async function main() {
    const [owner, userAddr] = await hre.ethers.getSigners();
    console.log("owner addr:", owner.address)

    // distribute eth to user address
    {
        let numAddresses = config.numAddresses
        for (let index = 0; index < numAddresses; index++) {
            const path = `m/44'/60'/0'/0/${index}`; // 派生路径
            const wallet = hre.ethers.Wallet.fromMnemonic(config.mnemonic, path); // 使用助记词和派生路径创建钱包
            let to = wallet.address
            //console.log(`索引 ${index} 的钱包地址:`, wallet.address);
            await owner.sendTransaction({
                "from": owner.address,
                "to": to,
                gasLimit: 100000,
                gasPrice: 15000000000,
                value: hre.ethers.utils.parseEther("50"),
            })
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});