/**
 * This is the address of the deployed contract.  Make sure to change this if you 
 * compile and deploy a new version of the contract
 * 
 * View the README for instructions on how to compile and deploy the contract.
 */
const CONTRACT_ADDRESS = process.env.FTR_CONTRACT_ADDRESS || 'FTR_CONTRACT_ADDRESS';

/**
 * This is the private key of the account that will be submitting transactions to the network (and thus
 * paying for them). This private key should not be shared with others - hence why it is stored server side.
 * 
 * For a production App, this should be stored as an environment variable.
 */
const PRIVATE_KEY = process.env.FTR_PRIVATE_KEY || 'FTR_PRIVATE_KEY';

/**
 * This endpoint will be the provider for our Web3 object.
 * 
 * Get your own API Key & endpoint here: https://dashboard.nodesmith.io
 */
const apiKey = process.env.NODESMITH_API_KEY || 'NODESMITH_API_KEY';
const NODESMITH_ENDPOINT = `https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=${apiKey}`;

const eventCacheApiKey = process.env.EVENT_CACHE_NODESMITH_API_KEY;
const EVENT_CACHE_NODESMITH_ENDPOINT = `https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=${eventCacheApiKey}`;

module.exports = {
  CONTRACT_ADDRESS,
  PRIVATE_KEY,
  NODESMITH_ENDPOINT,
  EVENT_CACHE_NODESMITH_ENDPOINT
}