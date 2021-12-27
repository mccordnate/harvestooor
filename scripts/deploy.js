const FRAX_ADDRESS = "0x853d955acef822db058eb8505911ed77f175b99e";
const RINKEBY_DAI_ADDRESS = "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa"

async function main() {
    const harvestooorFactory = await ethers.getContractFactory("Harvestooor");
    const harvestooorContract = await harvestooorFactory.deploy();
    await harvestooorContract.supportSaleToken(FRAX_ADDRESS, "10000000000000000");

    console.log("Harvestooor deployed to: ", harvestooorContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })