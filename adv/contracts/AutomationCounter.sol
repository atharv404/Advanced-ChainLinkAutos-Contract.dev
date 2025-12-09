// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface AutomationCompatibleInterface {
    function checkUpkeep(bytes calldata checkData)
        external
        returns (bool upkeepNeeded, bytes memory performData);

    function performUpkeep(bytes calldata performData) external;
}

contract AutomationCounter is AutomationCompatibleInterface {
    uint256 public counter;
    uint256 public lastBlock;
    uint256 public interval; // in blocks

    event UpkeepPerformed(uint256 newCounter, uint256 blockNumber);

    constructor(uint256 _interval) {
        interval = _interval;
        lastBlock = block.number;
    }

    function checkUpkeep(bytes calldata)
        external
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = (block.number - lastBlock) >= interval;
        performData = "";
    }

    function performUpkeep(bytes calldata) external override {
        require((block.number - lastBlock) >= interval, "Interval not reached");
        counter += 1;
        lastBlock = block.number;
        emit UpkeepPerformed(counter, block.number);
    }
}
