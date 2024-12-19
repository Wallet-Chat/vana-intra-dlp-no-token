// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IDataRegistry} from "../../dependencies/dataRegistry/interfaces/IDataRegistry.sol";
import {ITeePool} from "../../dependencies/teePool/interfaces/ITeePool.sol";

interface IDataLiquidityPool {
    struct File {
        uint256 timestamp;
        uint256 proofIndex;
        uint256 rewardAmount;
    }

    struct Contributor {
        EnumerableSet.UintSet filesList;
    }

    struct FileResponse {
        uint256 fileId;
        uint256 timestamp;
        uint256 proofIndex;
        uint256 rewardAmount;
    }

    function name() external view returns (string memory);
    function version() external pure returns (uint256);
    function dataRegistry() external view returns (IDataRegistry);
    function teePool() external view returns (ITeePool);
    function publicKey() external view returns (string memory);
    function proofInstruction() external view returns (string memory);
    function totalContributorsRewardAmount() external view returns (uint256);
    function fileRewardFactor() external view returns (uint256);

    function filesListCount() external view returns (uint256);
    function filesListAt(uint256 index) external view returns (uint256);
    function files(uint256 fileId) external view returns (FileResponse memory);
    function contributorsCount() external view returns (uint256);

    struct ContributorInfoResponse {
        address contributorAddress;
        uint256 filesListCount;
    }

    function contributors(uint256 index) external view returns (ContributorInfoResponse memory);
    function contributorInfo(address contributorAddress) external view returns (ContributorInfoResponse memory);
    function contributorFiles(address contributorAddress, uint256 index) external view returns (FileResponse memory);
    function pause() external;
    function unpause() external;
    function updateFileRewardFactor(uint256 newFileRewardFactor) external;
    function updateTeePool(address newTeePool) external;
    function updateProofInstruction(string calldata newProofInstruction) external;
    function updatePublicKey(string calldata newProofInstruction) external;
    function requestReward(uint256 registryFileId, uint256 proofIndex) external;
    function addRewardsForContributors(uint256 contributorsRewardAmount) external;
}