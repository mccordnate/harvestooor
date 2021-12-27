// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

contract Harvestooor is Ownable, ERC721Holder, ERC1155Holder, Pausable {
    using SafeERC20 for IERC20;


    mapping(IERC20 => uint256) internal saleTokens;

    event ERC721Sale(address nftContract, uint256 tokenId);
    event ERC1155Sale(address nftContract, uint256 tokenId, uint256 amount);
    event ERC1155BatchSale(address nftContract, uint256[] tokenIds, uint256[] amounts);

    event TokenSupported(address tokenAddress);
    event TokenSupportRemoved(address tokenAddress);

    constructor() {
    }

    modifier saleTokenSupported(IERC20 _saleToken) {
        require(saleTokens[_saleToken] != 0, "Token not supported");
        _;
    }

    function sellERC721(IERC721 _nftContract, uint256 _tokenId, IERC20 _saleToken) public whenNotPaused saleTokenSupported(_saleToken) {
        _saleToken.safeTransfer(msg.sender, saleTokens[_saleToken]);
        _nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        emit ERC721Sale(address(_nftContract), _tokenId);
    }

    function sellERC1155(IERC1155 _nftContract, uint256 _tokenId, uint256 _amount, IERC20 _saleToken) public whenNotPaused saleTokenSupported(_saleToken) {
        require(_amount <= 25, "Must sell 25 or less NFTs in a single transaction");
        _saleToken.safeTransfer(msg.sender, saleTokens[_saleToken] * _amount);
        _nftContract.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");
        emit ERC1155Sale(address(_nftContract), _tokenId, _amount);
    }

    function sellBatchERC1155(IERC1155 _nftContract, uint256[] memory _tokenIds, uint256[] memory _amounts, IERC20 _saleToken) public whenNotPaused saleTokenSupported(_saleToken) {
        require(_tokenIds.length == _amounts.length, "tokenIds must be as long as amounts");
        uint256 totalNFTs = 0;
        for (uint256 i = 0; i < _tokenIds.length; i++){
            require(_amounts[i] <= 25, "Must sell 25 or less NFTs of a single ID per transaction");
            totalNFTs+=_amounts[i];
        }
        _saleToken.safeTransfer(msg.sender, saleTokens[_saleToken] * totalNFTs);
        _nftContract.safeBatchTransferFrom(msg.sender, address(this), _tokenIds, _amounts, "");
        emit ERC1155BatchSale(address(_nftContract), _tokenIds, _amounts);
    }

    function supportSaleToken(IERC20 _tokenAddress, uint256 _one_cent_wei) public onlyOwner {
        saleTokens[_tokenAddress] = _one_cent_wei;
        emit TokenSupported(address(_tokenAddress));
    }

    function removeSaleToken(IERC20 _tokenAddress) public onlyOwner {
        saleTokens[_tokenAddress] = 0;
        emit TokenSupportRemoved(address(_tokenAddress));
    }

    function changeOneCentWeiValue(IERC20 _tokenAddress, uint256 _one_cent_wei) public onlyOwner{
        require(saleTokens[_tokenAddress] > 0, "Token not supported");
        saleTokens[_tokenAddress] = _one_cent_wei;
    }

    function getCurrentOneCentWeiValue(IERC20 _tokenAddress) public view returns (uint256) {
        return saleTokens[_tokenAddress];
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

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner{
        _unpause();
    }
}