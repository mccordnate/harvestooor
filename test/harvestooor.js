const { expect } = require("chai");
const { BigNumber, Contract } = require("ethers");
const { ethers } = require("hardhat");
const truffleAssert = require('truffle-assertions');

const WHATTY_CLUB_ABI = require('./ABI/WhattyClubABI.json')
const WHATTY_CLUB_ADDRESS = "0x064d54c858f884698ef34b1cae5d989a2414e1b6";
const WHATTY_CLUB_TOKEN_ID = 83;

const FRAX_ABI = require('./ABI/FraxABI.json');
const FRAX_ADDRESS = "0x853d955acef822db058eb8505911ed77f175b99e";

const APEIN_FINANCE_SHOP_ABI = require('./ABI/ApeInFinanceShopABI.json');
const APEIN_FINANCE_SHOP_ADDRESS = "0x7c10BC61de6781CaA00f2F6D8eB4822684337A2B";
const WEAK_HANDS_TOKEN_ID = 5;

describe("Harvest contract", function() {
    let harvestooorContract = null;
    let signer = null;

    before(async function() {
        const harvestooorFactory = await ethers.getContractFactory("Harvestooor");
        harvestooorContract = await harvestooorFactory.deploy();
        await harvestooorContract.supportSaleToken(FRAX_ADDRESS, "10000000000000000")

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xb0151D256ee16d847F080691C3529F316b2D54b3"],
          });
        signer = await ethers.getSigner("0xb0151D256ee16d847F080691C3529F316b2D54b3");

        const fraxContract = new ethers.Contract(FRAX_ADDRESS, FRAX_ABI, signer);
        await fraxContract.transfer(harvestooorContract.address, "500000000000000000");
    })

    it("Sell ERC721 to Harvestooor", async function() {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0xb0151D256ee16d847F080691C3529F316b2D54b3"],
          });
        signer = await ethers.getSigner("0xb0151D256ee16d847F080691C3529F316b2D54b3");

        const whattyContract = new ethers.Contract(WHATTY_CLUB_ADDRESS, WHATTY_CLUB_ABI, signer);
        await whattyContract.setApprovalForAll(harvestooorContract.address, true);

        const userHarvestooor = await harvestooorContract.connect(signer);
        await userHarvestooor.sellERC721(WHATTY_CLUB_ADDRESS, WHATTY_CLUB_TOKEN_ID, FRAX_ADDRESS);

        expect(await whattyContract.ownerOf(WHATTY_CLUB_TOKEN_ID)).to.equal(harvestooorContract.address);
    });

    it("Sell too many ERC1155 tokens", async function() {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95"],
        });
        signer = await ethers.getSigner("0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95");

        const apeContract = new ethers.Contract(APEIN_FINANCE_SHOP_ADDRESS, APEIN_FINANCE_SHOP_ABI, signer);
        await apeContract.setApprovalForAll(harvestooorContract.address, true);

        const userHarvestooor = await harvestooorContract.connect(signer);
        await truffleAssert.reverts(userHarvestooor.sellERC1155(APEIN_FINANCE_SHOP_ADDRESS, WEAK_HANDS_TOKEN_ID, 30, FRAX_ADDRESS), "Must sell 25 or less NFTs in a single transaction");
    });

    it("Sell ERC1155 tokens", async function() {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95"],
        });
        signer = await ethers.getSigner("0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95");

        const apeContract = new ethers.Contract(APEIN_FINANCE_SHOP_ADDRESS, APEIN_FINANCE_SHOP_ABI, signer);
        await apeContract.setApprovalForAll(harvestooorContract.address, true);
        const fraxContract = new ethers.Contract(FRAX_ADDRESS, FRAX_ABI, signer);
        const beforeBal = await fraxContract.balanceOf(signer.address);

        
        const userHarvestooor = await harvestooorContract.connect(signer);
        await userHarvestooor.sellERC1155(APEIN_FINANCE_SHOP_ADDRESS, WEAK_HANDS_TOKEN_ID, 3, FRAX_ADDRESS);
        const afterBal = await fraxContract.balanceOf(signer.address);

        expect(afterBal - beforeBal).to.equal(30000000000000000);
    });

    it("Batch sell too many ERC1155 tokens", async function() {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95"],
        });
        signer = await ethers.getSigner("0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95");

        const apeContract = new ethers.Contract(APEIN_FINANCE_SHOP_ADDRESS, APEIN_FINANCE_SHOP_ABI, signer);
        await apeContract.setApprovalForAll(harvestooorContract.address, true);

        const userHarvestooor = await harvestooorContract.connect(signer);
        await truffleAssert.reverts(userHarvestooor.sellBatchERC1155(APEIN_FINANCE_SHOP_ADDRESS, [4,WEAK_HANDS_TOKEN_ID], [1,30], FRAX_ADDRESS), "Must sell 25 or less NFTs of a single ID per transaction");
    });

    it("Batch sell ERC1155 tokens", async function() {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95"],
        });
        signer = await ethers.getSigner("0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95");

        const apeContract = new ethers.Contract(APEIN_FINANCE_SHOP_ADDRESS, APEIN_FINANCE_SHOP_ABI, signer);
        await apeContract.setApprovalForAll(harvestooorContract.address, true);
        const fraxContract = new ethers.Contract(FRAX_ADDRESS, FRAX_ABI, signer);
        const beforeBal = await fraxContract.balanceOf(signer.address);

        
        const userHarvestooor = await harvestooorContract.connect(signer);
        await userHarvestooor.sellBatchERC1155(APEIN_FINANCE_SHOP_ADDRESS, [4,WEAK_HANDS_TOKEN_ID], [1,20], FRAX_ADDRESS)
        const afterBal = await fraxContract.balanceOf(signer.address);

        expect(afterBal - beforeBal).to.equal(210000000000000000);
    });

    it("Non-owner attempted Emergency Withdraw ERC721", async function() {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: ["0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95"],
        });
        signer = await ethers.getSigner("0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95");

        const userHarvestooor = await harvestooorContract.connect(signer);
        await truffleAssert.reverts(userHarvestooor.emergencyWithdrawERC721(WHATTY_CLUB_ADDRESS, WHATTY_CLUB_TOKEN_ID, "0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95"), "Ownable: caller is not the owner");
    });

    it("Owner emergency withdraws ERC721", async function() {
        signer = await ethers.getSigner(0);
        const userHarvestooor = await harvestooorContract.connect(signer);
        await userHarvestooor.emergencyWithdrawERC721(WHATTY_CLUB_ADDRESS, WHATTY_CLUB_TOKEN_ID, "0x5ebe4c2f14cd027bb2bfce0116cdc4ceb1b68d95");

        const whattyContract = new ethers.Contract(WHATTY_CLUB_ADDRESS, WHATTY_CLUB_ABI, signer);
        await whattyContract.setApprovalForAll(harvestooorContract.address, true);

        expect(await whattyContract.ownerOf(WHATTY_CLUB_TOKEN_ID)).to.equal("0x5EbE4C2F14cd027bB2BfcE0116cDC4cEB1b68d95");
    })

    it("Remove token support", async function() {
        signer = await ethers.getSigner(0);

        expect(parseInt(await harvestooorContract.getCurrentOneCentWeiValue(FRAX_ADDRESS))).to.be.greaterThan(0);
        await harvestooorContract.removeSaleToken(FRAX_ADDRESS);
        expect(parseInt(await harvestooorContract.getCurrentOneCentWeiValue(FRAX_ADDRESS))).to.equal(0);
    })
});