import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Typography } from '@material-ui/core';
import Web3 from 'aion-web3';

import './App.css';
import RecordInput from './RecordInput';
import RecordList from './RecordList';
import SettingsDialog from './SettingsDialog';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  flex: {
    flex: 1,
  },
  footer: {
    textAlign: 'center',
    padding: 8,
    backgroundColor: theme.palette.grey['100']
  },
});

/**
 * This is the main component of the For The Record app.  It lays out
 * the other components of the app, and is responsible for all interaction with the Aion Network.
 * 
 * Normally, you might use a state management library such as Redux to handle your app's data.
 * To keep it simple, we just store the app data as state in the base App component.
 * 
 * This component has the functionality to submit a message to the app backend - where
 * it will be submitted as a transaction to the Aion network.  It also reads directly from
 * the smart contract event log in order to build up the app state..
 */
class App extends Component {
  constructor(props) {
    super(props);
    const savedSettings = this.loadSettings();
    this.state = { 
      messages: {},
      loadingMessages: false,
      submittingMessage: false,
      settingsDialogOpen: false,
      loadTime: 0,
      showResetSettings: false,
      blockCount: savedSettings.blockCount,
      eventCacheEnabled: savedSettings.eventCacheEnabled
    };
  }

  /**
   * Sends a message to the backend, where it will be submitted to the Aion network.
   */
  submitMessage = async (message) => {
    this.setState({ submittingMessage: true });

    const rawResponse = await fetch(`/submitRecord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html'
      },
      body: JSON.stringify({ message: message })
    });
    
    const content = await rawResponse.json();
    if (content.status === 'success') {
      const messages = Object.assign({}, this.state.messages);
      messages[content.hash] = {
        text: message,
        isPending: true,
      };

      this.setState({ messages });
      console.log(`Message submitted: ${content.url}`);

      // Once the transaction has been mined we need to clean up the UI
      // state so that the latest message no longer says pending. 
      const checkReceipt = this.accountInterval = window.setInterval(() => {
        this.checkTransactionStatus(checkReceipt, content.hash, message);
      }, 1000);
    } else {
      console.error('Unexpected error when submitting the message.');
    }

    this.setState({ submittingMessage: false });
  }

  /**
   * Helper function that pings getTransactionReceipt for a specific tx hash.
   * Interval will ping every second until the transaction has been mined.
   */
  checkTransactionStatus = async (interval, hash, message) => {
    const contractInfo = this.state.contractInfo;
    const web3 = new Web3(new Web3.providers.HttpProvider(contractInfo.endpoint));
    
    web3.eth.getTransactionReceipt(hash, (error, receipt) => {
      if (error) {
        console.error(error);
        clearInterval(interval);
      }

      if (receipt && receipt.status) {
        const messages = Object.assign({}, this.state.messages);
        messages[hash] = {
          text: message,
          isPending: false,
        };
        this.setState({ messages });
        clearInterval(interval);
      }
    });
  }
  
  /**
   * Helper method that reads info from the server about the ForTheRecord contract.
   * The response contains the Web3 endpoint, contract ABI, & contract Address
   */ 
  getContractInfo = async () => {
    const rawResponse = await fetch(`/contractInfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    
    return await rawResponse.json();
  };

  /**
   * Within the componentDidMount, we read the event log of our smart contract.
   * This allows us to populate the app state with previous messages from the contract.
   * 
   * Currently, reading events is pretty slow, so in this demo app, we only check the last 1000 blocks.
   */
  componentDidMount = () => {
    (async () => {
      this.setState({ loadingMessages: true });

      const contractInfo = await this.getContractInfo();
      this.setState( { contractInfo }, this.loadEvents);
    })();
  }

  loadEvents = async () => {
    this.setState({ loadingMessages: true });
    const contractInfo = this.state.contractInfo;
    const endpoint = this.state.eventCacheEnabled ? contractInfo.eventCacheEndpoint : contractInfo.endpoint;
    console.log(`Using endpoint ${endpoint}`);
    const web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
    const contract = new web3.eth.Contract(contractInfo.abi, contractInfo.address);

    const blockNum = await web3.eth.getBlockNumber();
    const startBlock = Math.max(0, blockNum - this.state.blockCount);

    const startTime = new Date().getTime();
    let currentLoadTime = 0;
    const interval = window.setInterval(() => {
      const endTime = new Date().getTime();
      currentLoadTime = (endTime - startTime) / 1000;
      if (currentLoadTime > 5 && !this.state.showResetSettings) {
        this.setState({ showResetSettings: true})
      }
    }, 25);

    contract.getPastEvents('AllEvents', { fromBlock: startBlock, toBlock: 'latest' }, (error, eventLogs) => {
      const messages = {};
      window.clearInterval(interval);
      const loadTime = (new Date().getTime() - startTime) / 1000;
      this.setState({ loadTime });
      if (!error) {
        eventLogs.forEach(event => {
          messages[event.transactionHash] = {
            text: event.returnValues.message,
            isPending: false,
          }
        });

        this.setState({ messages });
      } else {
        console.log(`An unexpected error occurred when reading event logs: ${error}`)
      }

      this.setState({ loadingMessages: false, showResetSettings: false });
    });
  }

  showSettingsDialog = () => {
    this.setState({settingsDialogOpen: true});
  }

  closeSettingsDialog = (newSettings) => {
    this.setState({settingsDialogOpen: false});

    if (newSettings) {
      this.setState(newSettings, this.loadEvents);
      this.persistSettings(newSettings);
    }
  }

  loadSettings = () => {
    try {
      const currentSettings = window.localStorage.getItem('eventCacheSettings');
      if (currentSettings) {
        return JSON.parse(currentSettings);
      }
    } catch(e) {}

    return {
      blockCount: 1000,
      eventCacheEnabled: false
    };
  }

  persistSettings = (newSettings) => {
    const settingsString = JSON.stringify(newSettings);
    window.localStorage.setItem('eventCacheSettings', settingsString);
  }

  resetSettings = () => {
    this.persistSettings({
      blockCount: 1000,
      eventCacheEnabled: false
    });

    window.location.reload();
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        <RecordInput submitMessage={this.submitMessage} submittingMessage={this.state.submittingMessage} />
        <RecordList
          eventCacheEnabled={this.state.eventCacheEnabled} showSettingsDialog={this.showSettingsDialog}
          blockCount={this.state.blockCount} loadTime={this.state.loadTime} messages={this.state.messages}
          transactionHashes={this.state.transactionHashes} loadingMessages={this.state.loadingMessages}
          showResetSettings={this.state.showResetSettings} resetSettings={this.resetSettings}/>
        <div className={this.props.classes.flex}/>
        <div className={this.props.classes.footer}>
          <Typography>Made with <span role="img" aria-label="heart">❤️</span> by <a target="_blank" rel="noopener noreferrer" href="https://nodesmith.io/aion.html">Nodesmith</a></Typography>
        </div>
        <SettingsDialog 
          eventCacheEnabled={this.state.eventCacheEnabled} 
          blockCount={this.state.blockCount}
          closeSettingsDialog={this.closeSettingsDialog}
          isOpen={this.state.settingsDialogOpen} />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
