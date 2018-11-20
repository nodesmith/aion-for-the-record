const fs = require('fs');
const Web3 = require('aion-web3');
const Constants = require('./constants');

// This is the helper that actually does the work to compile the contract.
// If the compileOnly flag is set to true, the contract won't be deployed.
const compileAndDeploy = async (endpoint, fileName, compileOnly) => {
  // Configure web3 to use the correct provider.
  const web3 = new Web3(new Web3.providers.HttpProvider(endpoint));

  // Read the file that contains the forTheRecord contract.
  const sol = fs.readFileSync(fileName, {
    encoding: 'utf8'
  });
  console.log('Read file from ' + fileName);
  
  // Compile the contract with web3.  This will use the Nodesmith endpoint to compile the
  // contract string and return the ABI and  
  const compiled = await web3.eth.compileSolidity(sol);
  console.log('Compiled Solidity file successfully');
  console.log(compiled);

  if (!compileOnly) {    
    const signedAccount = web3.eth.accounts.privateKeyToAccount(Constants.PRIVATE_KEY);
    const contract = new web3.eth.Contract(compiled.ForTheRecord.info.abiDefinition);
    const deployment = contract.deploy({data: compiled.ForTheRecord.code});

    const gasEstimate = await deployment.estimateGas({
      value: 0,
      gasPrice: '0x9502F9000', // 40000000000
      from: signedAccount.address
    });

    const contractData = deployment.encodeABI();
  
    const transaction = {
      value: 0,
      gasPrice: '0x4A817C800', // 20000000000
      gas: gasEstimate,
      data: contractData,
    };

    console.log('\nSigning and sending deployment transaction.')
    const signedTx = await signedAccount.signTransaction(transaction);
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
    console.log(`Deploy complete. Transaction receipt:\n${JSON.stringify(txReceipt, undefined, 2)}\n`);
    console.log('--------------------------------------------');
    console.log(`New contract deployed at address ${txReceipt.contractAddress}`);
    console.log('--------------------------------------------');
  } else {
    console.log('Skipping deploy since compileOnly is set');
  }
}

const compileOnly = process.argv[2] || false;

compileAndDeploy(Constants.NODESMITH_ENDPOINT, './contract/ForTheRecord.sol', compileOnly)