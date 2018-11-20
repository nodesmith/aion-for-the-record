const express = require('express');
const path = require('path');
const Web3 = require('aion-web3');
const BN = require('bn.js');
const cryptojs = require('crypto-js');
const bodyParser = require('body-parser');
const fs = require('fs');

const Constants = require('./contract/constants');

// Sanity check that the contract address has been configured
if (Constants.CONTRACT_ADDRESS === '' || Constants.CONTRACT_ADDRESS === 'FTR_CONTRACT_ADDRESS') {
  console.error('The contract address is invalid.  Please compile the contract and place the compiled contract address in ./contract/constants');
  process.exit();
}

// Basic express server configuration
const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Helper function that reads the solidity contract, compiles it using web3, and returns the compiled contract object.
const getCompiledContract = async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider(Constants.NODESMITH_ENDPOINT));
  
  const sol = fs.readFileSync('./contract/ForTheRecord.sol', {
    encoding: 'utf8'
  });

  return await web3.eth.compileSolidity(sol);
}

// Server index.html when visiting the naked URL
app.get('/', (request,response) => {
  response.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/**
 * This endpoint allows the client to get information about the For The Record contract.
 * This allows us to keep the contract itself on the server side, rather than forcing 
 * the client to know about the raw contract and compile it themselves. 
 */
app.get('/contractInfo', async (request,response) => {
  const compiled = await getCompiledContract();
  response.json({
    abi: compiled.ForTheRecord.info.abiDefinition,
    address: Constants.CONTRACT_ADDRESS,
    endpoint: Constants.NODESMITH_ENDPOINT,
  });
});

/**
 * The client will send a post request to this endpoint with the message they wish to store
 * on chain in the body of the request.  This endpoint will then submit that message to the 
 * Aion network in a transaction by calling our smart contract's storeHash method.
 */
app.post('/submitRecord', async (request,response) => {
  const message = request.body.message;
  console.log("received message from client: " + message);

  // -----------------------------------------------------------------
  // Step 1: Compile the contract at runtime to get a contract object.
  // -----------------------------------------------------------------

  // Create our web3 object & an account object will be later used to send the tx.
  const web3 = new Web3(new Web3.providers.HttpProvider(Constants.NODESMITH_ENDPOINT));
  const signedAccount = web3.eth.accounts.privateKeyToAccount(Constants.PRIVATE_KEY);

  // Get a compiled contract object
  const compiled = await getCompiledContract();
  const contract = new web3.eth.Contract(compiled.ForTheRecord.info.abiDefinition, Constants.CONTRACT_ADDRESS);


  // -----------------------------------------------------------------
  // Step 2: Prepare the transaction we will send with correct params.
  // -----------------------------------------------------------------

  // The first param is a MD5 hash of the message to be sent. 
  // The hash is stored as a uint128, so we use the BN library to convert it.
  const messageHash = cryptojs.MD5(message);
  const messageHashAsString = `0x${messageHash.toString()}`;
  const hash = new BN(messageHashAsString);
  
  // Using the contract object, we can get an object that represents
  // the function in the smart contract we are trying to call.
  // That object allows us to estimate the gas needed for that function, and gives us the data
  // needed to tell the transaction to execute said function. 
  const storeHashCall = contract.methods.storeHash(hash, message);
  
  // Now we can estimate how much gas the this call will take.
  const gasEstimate = await storeHashCall.estimateGas({from: signedAccount.address});

  // Finally, we can create a parameters object. This will be used in the signature
  // of the transaction and dictates what is sent.
  const transactionParameters = {
    to: Constants.CONTRACT_ADDRESS,
    from: signedAccount.address,
    gasPrice: '0x4A817C800', // 20000000000
    gas: gasEstimate,
    data: storeHashCall.encodeABI(),
  };


  // -----------------------------------------------------------------
  // Step 3: Sign and send the transaction.
  // -----------------------------------------------------------------

  // Using the parameters we just created, we can create a signedTransaction object.
  const signedTx = await signedAccount.signTransaction(transactionParameters);

  // Send the transaction.
  web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .once('transactionHash', (hash) => {
      // This will execute once the transaction has been successfully submitted.
      console.log(`Received transaction hash ${hash}`);
      const explorerUrl = 'https://mastery.aion.network/#/transaction/' + hash;
      console.log(`Check ${explorerUrl} once transaction is confirmed.`);
      response.send(JSON.stringify({
        status: 'success',
        url: explorerUrl,
        hash: hash,
      }));
    })
    .on('error', (error) => {
      console.error(`Error occurred sending transaction ${error}`);
      response.send(JSON.stringify({
        status: 'fail',
      }));
    })
    .then((receipt) => {
      // This will be fired once the receipt is mined.
      // Since our dApp is fairly simple, we aren't doing anything yet with this info other than logging it.
      console.log(`Transaction sent successfully. Receipt: ${JSON.stringify(receipt)}`);
      return receipt;
    });
});

const port = process.env.PORT || 8080;
console.log("Starting server on port: " + port)
app.listen(port);