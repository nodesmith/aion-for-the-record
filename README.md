# aion-for-the-record
A simple Aion DApp that permanently records a 140 character message into the Aion Network blockchain.
View a running demo at [https://aion-for-the-record.herokuapp.com/](https://aion-for-the-record.herokuapp.com/).

View the full tutorial here:
[https://medium.com/nodesmith-blog/for-the-record-a-simple-open-source-aion-dapp-47e5bb81beac](https://medium.com/nodesmith-blog/for-the-record-a-simple-open-source-aion-dapp-47e5bb81beac)

This sample isn't a 'pure' dApp, because it utilizes a lightweight server component to handle writing transactions to the Aion network.  However, this is a very useful pattern when you wish to pay the transaction fees for your users.  This repository will soon have a sister repo that utilizes the [Aiwa Wallet](https://getaiwa.com) to provide a client only experience.

## Quick Start

### Prerequisites
* an API Key from [Nodesmith](https://nodesmith.io)
* node.js version 10 or higher installed
* installed [Aion Desktop Wallet](https://docs.aion.network/docs/install-the-aion-desktop-wallet)

### Setup & Running Locally

#### 0) Install dependencies

Run `npm install`.

#### 1) Create your private key string from an Aion Keystore
First, you will need to extract the keystore for an account to a known location. [Here are instructions](http://dev-docs.nodesmith.io/#/gettingStarted/privateKeys/export_keystore) for doing this from the Aion Desktop Wallet.

Make note of the location of the exported keystore and the password that you chose to protect the keystore.

Next, run the following script `npm run generateKey -- PATH_TO_KEYSTORE KEYSTORE_PASSWORD` with `PATH_TO_KEYSTORE` and `KEYSTORE_PASSWORD` replaced with the correct values.  For example: `npm run generateKey -- ./contract/demoKeyStore 123`. This script will generate a private key based on your keystore.  Keep this private key safe, and never store it client side.

Finally, replace `PRIVATE_KEY` in `./contract/constants.js` with this value.

#### 2) Configure your Nodesmith endpoint

Replace `YOUR_API_KEY` in `./contract/constants.js` with your API Key.

The Nodesmith endpoint is currently configured to use the Mastery testnet.  When you are ready to deploy your contract
on the mainnet, you can edit the `NODESMITH_ENDPOINT` in that file to point to the mainnet.

#### 3) Fund your account with some test Aion coin

In order to deploy a contract and send transaction, your account will need some Aion coin.

You can request some testnet Aion from the [Mastery Faucet](https://gitter.im/aionnetwork/mastery_faucet).

#### 3) Compile & deploy the contract

The main contract can be found in `./contract/ForTheRecord.sol`.

* Run `npm run deploy` to compile & deploy the contract.
* Replace `CONTRACT_ADDRESS` in `./contract/constants.js` with the contract address printed out in the deploy script.

**Note:** You can run `npm run compile` if you wish to just compile the contract but not deploy it.

#### 4) Run the sample locally

* Run `npm start` to start the client
* Run `node server.js` to start the server
* Open `localhost:8080` in your browser 

## Technologies Used

* [The Aion Network](https://aion.network)
* [Create React App](https://facebook.github.io/create-react-app/docs/getting-started)
* [Material UI React Component Library](https://material-ui.com/)
* [Express](https://expressjs.com/)
* [Nodesmith](https://nodesmith.io)

## Develop Mode
`npm run dev`