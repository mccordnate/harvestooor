const FRAX_ADDRESS = "0x853d955acef822db058eb8505911ed77f175b99e";

async function main() {
    const harvestooorFactory = await ethers.getContractFactory("Harvestooor");
    const harvestooorContract = await harvestooorFactory.deploy(FRAX_ADDRESS, 18);

    console.log("Harvestooor deployed to: ", harvestooorContract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })