// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external payable;
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
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

interface IManualPriceOracle {
    function setPrice(address asset, uint256 price) external;
    function getPrice(address asset) external view returns (uint256);
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address a) external view returns (uint256);
}

contract TestAaveLiquidation {
    IAavePool public pool;
    IManualPriceOracle public oracle;
    address public collateralAsset; // e.g. WETH
    address public debtAsset;       // e.g. DAI

    struct HFRecord {
        uint256 blockNumber;
        uint256 timestamp;
        uint256 healthFactor;
    }

    HFRecord[] public healthHistory;

    event Supplied(address asset, uint256 amount);
    event Borrowed(address asset, uint256 amount);
    event PriceUpdated(address asset, uint256 newPrice);
    event HealthFactorRecorded(uint256 blockNumber, uint256 timestamp, uint256 healthFactor);

    constructor(address _pool, address _oracle, address _collateralAsset, address _debtAsset) {
        pool = IAavePool(_pool);
        oracle = IManualPriceOracle(_oracle);
        collateralAsset = _collateralAsset;
        debtAsset = _debtAsset;
    }

    function supply(address asset, uint256 amount) external payable {
        if (asset == address(0)) {
            // supply native ETH as collateral if pool supports it
            pool.supply{value: amount}(address(0), amount, address(this), 0);
        } else {
            IERC20(asset).approve(address(pool), amount);
            pool.supply(asset, amount, address(this), 0);
        }
        emit Supplied(asset, amount);
        _recordHealthFactor();
    }

    function borrow(address asset, uint256 amount, uint256 rateMode) external {
        pool.borrow(asset, amount, rateMode, 0, address(this));
        emit Borrowed(asset, amount);
        _recordHealthFactor();
    }

    function setPriceFeedValue(address asset, uint256 newPrice) external {
        require(newPrice > 0, "price zero");
        oracle.setPrice(asset, newPrice);
        emit PriceUpdated(asset, newPrice);
        _recordHealthFactor();
    }

    function getHealthFactor() public view returns (uint256) {
        (, , , , , uint256 hf) = pool.getUserAccountData(address(this));
        return hf;
    }

    function getPrice(address asset) external view returns (uint256) {
        return oracle.getPrice(asset);
    }

    function getHealthHistoryLength() external view returns (uint256) {
        return healthHistory.length;
    }

    function _recordHealthFactor() internal {
        uint256 hf = getHealthFactor();
        healthHistory.push(HFRecord({
            blockNumber: block.number,
            timestamp: block.timestamp,
            healthFactor: hf
        }));
        emit HealthFactorRecorded(block.number, block.timestamp, hf);
    }

    receive() external payable {}
}
