// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Harvestooor is Ownable, ERC721Holder, ERC1155Holder {
    using SafeERC20 for IERC20;

    IERC20 saleToken;
    uint256 internal constant ONE_CENT_WEI = 10000000000000000;

    constructor(IERC20 _saleToken) {
        saleToken = _saleToken;
    }

    function sellERC721(IERC721 _nftContract, uint256 _tokenId) public {
        _nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        saleToken.safeTransfer(msg.sender, ONE_CENT_WEI);
    }

    function sellERC1155(IERC1155 _nftContract, uint256 _tokenId, uint256 _amount) public {
        require(_amount <= 25, "Must sell 25 or less NFTs in a single transaction");
        _nftContract.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");
        saleToken.safeTransfer(msg.sender, ONE_CENT_WEI * _amount);
    }

    function sellBatchERC1155(IERC1155 _nftContract, uint256[] memory _tokenIds, uint256[] memory _amounts) public {
        uint256 totalNFTs = 0;
        for (uint256 i = 0; i < _tokenIds.length; i++){
            require(_amounts[i] <= 25, "Must sell 25 or less NFTs of a single ID per transaction");
            totalNFTs+=_amounts[i];
        }
        _nftContract.safeBatchTransferFrom(msg.sender, address(this), _tokenIds, _amounts, "");
        saleToken.safeTransfer(msg.sender, ONE_CENT_WEI * totalNFTs);
    }

    function emergencyWithdrawERC721(IERC721 _nftContract, uint256 _tokenId, address _receiver) public onlyOwner {
        _nftContract.safeTransferFrom(address(this), _receiver, _tokenId);
    }

    function emergencyWithdrawERC1155(IERC1155 _nftContract, uint256 _tokenId, uint256 _amount, address _receiver) public onlyOwner {
        _nftContract.safeTransferFrom(address(this), _receiver, _tokenId, _amount, "");
    }

    function emergencyWithdrawBatchERC1155(IERC1155 _nftContract, uint256[] memory _tokenIds, uint256[] memory _amounts, address _receiver) public onlyOwner {
        _nftContract.safeBatchTransferFrom(address(this), _receiver, _tokenIds, _amounts, "");
    }

    function emergencyWithdrawERC20(IERC20 _tokenContract, address _receiver, uint256 _value) public onlyOwner {
        _tokenContract.safeTransfer(_receiver, _value);
    }
}