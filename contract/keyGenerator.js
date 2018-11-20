/**
 * This is a simple script that generates and logs an Aion private key from a keystore file.
 * 
 * The private key is used to sign transactions. 
 * 
 * View the README for instructions on how to get a keystore file and use this script.
 */

if (process.argv.length !== 4) {
  console.error('Wrong number of parameters.');
  console.error('Usage: node keyGenerator.js <keystoreFilePath> <keystoreFilePassword>');
  return -1;
}

const keystoreFilePath = process.argv[2];
const keystoreFilePassword = process.argv[3];

console.log(keystoreFilePath)

// Use the fs module to read the keystore file
const fs = require('fs');
const keystoreFile = fs.readFileSync(keystoreFilePath);

// Import the aion keystore module to process the keystore file
const AionKeystore = require('aion-keystore');
const aionKeystore = new AionKeystore();

// Unlock the account and use it to get the private key
const unlockedAccount = aionKeystore.decryptFromRlp(keystoreFile, keystoreFilePassword);

console.log(unlockedAccount.privateKey);