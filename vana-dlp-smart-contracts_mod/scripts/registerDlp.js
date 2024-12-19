const fs = require('fs');
const path = require('path');

// Load ABI from file
const abiPath = path.join(__dirname, 'abi.json');
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

async function main() {
    console.log("Script starting...");
    
    try {
        const { ethers } = require("hardhat");
        console.log("Hardhat ethers loaded");

        // Get the signer (deployer)
        console.log("Getting signers...");
        const [signer] = await ethers.getSigners();
        console.log("Signer obtained:", signer.address);

        //const proxyAddress = "0xf408A064d640b620219F510963646Ed2bD5606BB";
        //const dlpAddress = "0x85300479697718B5edDB06c0c3173eDa265870C1";
        const proxyAddress = "0xff14346dF2B8Fd0c95BF34f1c92e49417b508AD5";
        const dlpAddress = "0xB973069d8977173f55Aaa8101A3F7f2bDaffD1C9";
        const dlpOwnerAddress = "0x0388B9f99EafDe4EdBbB3053baf9c9fCf4493bFE";
        
        console.log("Using addresses:");
        console.log("Proxy:", proxyAddress);
        console.log("DLP:", dlpAddress);
        console.log("DLP Owner:", dlpOwnerAddress);

        // Create contract instance
        const contract = new ethers.Contract(proxyAddress, abi, signer);

        // Check contract state before proceeding
        console.log("\nChecking contract state...");
        
        try {
            const minStake = await contract.minDlpStakeAmount();
            console.log("Min DLP Stake Amount:", minStake.toString());
            
            const paused = await contract.paused();
            console.log("Contract paused:", paused);
            
            // Try to get DLP status if such function exists
            try {
                const dlpStatus = await contract.getDlpStatus(dlpAddress);
                console.log("DLP Status:", dlpStatus);
            } catch (e) {
                console.log("Could not get DLP status");
            }
        } catch (e) {
            console.log("Could not get some contract state");
        }

        // Parameters for the call
        const stakersPercentage = ethers.parseUnits("50", 18);
        const value = ethers.parseUnits("100.0", 18);
        
        console.log("\nParameters:");
        console.log("Stakers Percentage:", stakersPercentage.toString());
        console.log("Value:", value.toString());

        // Try to estimate gas first
        console.log("\nEstimating gas...");
        try {
            const gasEstimate = await contract.registerDlp.estimateGas(
                dlpAddress,
                dlpOwnerAddress,
                stakersPercentage,
                { value }
            );
            console.log("Estimated gas:", gasEstimate.toString());
        } catch (error) {
            console.error("Gas estimation failed. Error:", error);
            if (error.data) {
                // Try to decode the error
                try {
                    const iface = new ethers.Interface(abi);
                    const decodedError = iface.parseError(error.data);
                    console.error("Decoded error:", decodedError);
                } catch (e) {
                    console.log("Could not decode error");
                }
            }
            // Continue anyway
        }

        // Send the transaction
        console.log("\nSending transaction...");
        const tx = await contract.registerDlp(
            dlpAddress,
            dlpOwnerAddress,
            stakersPercentage,
            {
                value,
                gasLimit: 500000
            }
        );

        console.log("Transaction sent!");
        console.log("Hash:", tx.hash);
        console.log("Data:", tx.data);
        
        console.log("\nWaiting for confirmation...");
        const receipt = await tx.wait();
        
        if (receipt.status === 0) {
            throw new Error("Transaction failed");
        }

        console.log("Transaction confirmed!");
        console.log("Block:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());

    } catch (error) {
        console.error("\nFailed during execution:");
        if (error.error && error.error.message) {
            console.error("Error message:", error.error.message);
        }
        if (error.reason) {
            console.error("Reason:", error.reason);
        }
        if (error.data) {
            console.error("Error data:", error.data);
        }
        throw error;
    }
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    }); 
