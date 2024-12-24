const hre = require("hardhat");
const config = require("./deploy-config.json");
const BigNumber = require("bignumber.js");

async function main() {
    const [owner, userAddr] = await hre.ethers.getSigners();
    console.log("owner addr:", owner.address)

    const faucet = await hre.ethers.getContractAt("Faucet", config.faucet, owner);
    const pool = await hre.ethers.getContractAt("Pool", config.pool, owner)
    let amount = 1000000000000000000000n
    await faucet.setMaximumMintAmount(amount)
    {
        let amount2 = 10000000000000n
        for (let i = 0; i < config.erc20Tokens.length; i++) {
            let erc20Addr = config.erc20Tokens[i]
            await faucet.mint(erc20Addr, owner.address, amount)

            let erc20Instance = await hre.ethers.getContractAt("@aave/aave-token/contracts/open-zeppelin/ERC20.sol:ERC20", erc20Addr, owner)
            await erc20Instance.approve(config.pool, amount)

            await pool.deposit(erc20Addr, amount2, owner.address, 0);
        }
        for (let i = 0; i < config.depositToken.length; i++) {
            let erc20Addr = config.depositToken[i]
            await faucet.mint(erc20Addr, owner.address, amount)

            let erc20Instance = await hre.ethers.getContractAt("@aave/aave-token/contracts/open-zeppelin/ERC20.sol:ERC20", erc20Addr, owner)
            await erc20Instance.approve(config.pool, amount)

            await pool.deposit(erc20Addr, amount2, owner.address, 0);
        }
    }
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
            let signer = wallet.connect(hre.ethers.provider)

            // distribute erc20 to user address
            let amount2 = 10000000000000n
            for (let i = 0; i < config.erc20Tokens.length; i++) {
                let erc20Addr = config.erc20Tokens[i]
                await faucet.mint(erc20Addr, to, amount)
                await pool.deposit(erc20Addr, amount2, to, 0);

                let erc20Instance = await hre.ethers.getContractAt("@aave/aave-token/contracts/open-zeppelin/ERC20.sol:ERC20", erc20Addr, signer)
                await erc20Instance.approve(config.pool, amount)
            }
            for (let i = 0; i < config.depositToken.length; i++) {
                let erc20Addr = config.depositToken[i]
                let erc20Instance = await hre.ethers.getContractAt("@aave/aave-token/contracts/open-zeppelin/ERC20.sol:ERC20", erc20Addr, signer)
                await erc20Instance.approve(config.pool, amount)
            }

        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});