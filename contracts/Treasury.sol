// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    constructor(address timelock) Ownable(timelock) {}

    receive() external payable {}

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdrawFunds(address payable to, uint256 amount)
        external
        onlyOwner
    {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
    }
}
