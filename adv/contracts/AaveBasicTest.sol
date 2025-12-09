// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external payable;
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
    function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external payable returns (uint256);
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address a) external view returns (uint256);
}

contract AaveBasicTest {
    IAavePool public pool;
    address public weth; // collateral & borrow asset for simplicity

    constructor(address _pool, address _weth) {
        pool = IAavePool(_pool);
        weth = _weth;
    }

    // Supply all ETH sent in msg.value as collateral (assuming pool accepts native via wrapped asset route on staging)
    function supplyETH() external payable {
        // For QA we just call supply with asset = weth and amount = msg.value
        pool.supply{value: msg.value}(weth, msg.value, address(this), 0);
    }

    function borrow(uint256 amount, uint256 rateMode) external {
        pool.borrow(weth, amount, rateMode, 0, address(this));
    }

    function repay(uint256 amount, uint256 rateMode) external payable {
        pool.repay{value: amount}(weth, amount, rateMode, address(this));
    }

    function withdraw(uint256 amount) external {
        pool.withdraw(weth, amount, msg.sender);
    }

    function getHealthFactor() external view returns (uint256) {
        (, , , , , uint256 hf) = pool.getUserAccountData(address(this));
        return hf;
    }
}
