/*
  For the Record - store a string of data on Aion forever.
  Open source sample DApp - the the tutorial here:
  https://medium.com/nodesmith-blog/for-the-record-a-simple-open-source-aion-dapp-47e5bb81beac
*/

pragma solidity ^0.4.10;

contract ForTheRecord {
    // Emit an event indicating that this hash was submitted at this time. The event and its data are
    // stored as part of the transaction, so there's no need to store this in the contract itself
    // The indexed keyword allows searching for events using that parameter as a filter.
    event RecordSaved(uint128 indexed hash, uint128 blockNumber, string message);

    function ForTheRecord() public { }

    // This function will "store" a message and a hash of this message by emitting 
    // that data as an event.  The hash is used for filtering events, but can also be useful
    // if you want this smart contract to work for larger data objects, such as full files.
    // In that case, you could store the actual file on IPFS or a similar service, but just
    // store the hash on the file with this contract.
    function storeHash(uint128 hash, string message) public {
        uint128 blockNumber = block.number;
        RecordSaved(hash, blockNumber, message);
    }
}