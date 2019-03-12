import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, CircularProgress, Grid, Typography, IconButton, Button } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';

const styles = theme => ({
  header: {
    margin: theme.spacing.unit * 3
  },
  message: {
    fontWeight: 100,
    marginBottom: theme.spacing.unit,
  },
  messageContainer: {
    marginBottom: theme.spacing.unit * 4,
    width: '80%',
    maxWidth: 600,
    textAlign: 'center',
  },
  settingsButton: {
    marginLeft: theme.spacing.unit * 1
  },
  resetSettingsButton: {
    marginTop: theme.spacing.unit * 2
  }
});

/**
 * The record list component is responsible for rendering the messages that have been
 * submitted to the smart contract. It will display the message and the transaction
 * hash associated with that message.
 */
class RecordList extends Component {
  render() {
    const messageElements = Object.keys(this.props.messages).slice(0).reverse().map((txHash) => {
      const { text, isPending } = this.props.messages[txHash];
      const status = (isPending) ? 'PENDING' : 'CONFIRMED';
      return (
        <Grid item key={txHash} className={this.props.classes.messageContainer}>
          <Typography variant="h5" className={this.props.classes.message}>
            "{text}"
          </Typography>
          <Typography variant="caption" noWrap>
            Transaction Status: <a target="_blank" rel="noopener noreferrer" href={`https://mastery.aion.network/#/transaction/${txHash}`}>
              {status}
            </a>
          </Typography>
          
        </Grid> 
      );
    });

    // If there aren't any messages in the last 1000 blocks, push a "no message" element.
    if (messageElements.length === 0) {
      messageElements.push(
        ( 
        <Grid item key="noMessages" className={this.props.classes.messageContainer}>
          <Typography align="center" variant="h5" className={this.props.classes.message}>
            No Messages
          </Typography>
        </Grid>
        )
      )
    }

    const spinner = (
      <Grid container direction="column" alignItems="center">
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
        <Grid item xs={12} className={this.props.classes.resetSettingsButton}>
          {this.props.showResetSettings ? 
            (<Button onClick={this.props.resetSettings} color="secondary" variant="outlined">
            Abort Loading and Reset Settings</Button>) : null}
        </Grid>
      </Grid>);

    const eventCacheStatus = this.props.loadingMessages ? '' :
      `Event Cache ${this.props.eventCacheEnabled ? 'Enabled' : 'Disabled'}. Loaded in ${this.props.loadTime} seconds`;

    return (
      <Grid container alignItems="center" direction="column">
        <Grid item xs={6} className={this.props.classes.header}>
          <Typography variant="h5">{messageElements.length.toString()} Messages in last {this.props.blockCount.toLocaleString()} blocks
            <IconButton disabled={this.props.loadingMessages}
              className={this.props.classes.settingsButton}
              aria-label="Settings"
              onClick={this.props.showSettingsDialog}>
              <SettingsIcon />
            </IconButton>
          </Typography>
          <Typography align="center" variant="caption">
            {eventCacheStatus}
          </Typography>
        </Grid>
        
        { (this.props.loadingMessages) ? spinner : messageElements }
      </Grid>
    );
  }
}

RecordList.propTypes = {
  classes: PropTypes.object.isRequired,
  // messages[txHash] = { e, isPending }
  messages: PropTypes.object.isRequired,
  loadingMessages: PropTypes.bool.isRequired,
  blockCount: PropTypes.number.isRequired,
  eventCacheEnabled: PropTypes.bool.isRequired,
  showSettingsDialog: PropTypes.func.isRequired,
  showResetSettings: PropTypes.bool.isRequired,
  resetSettings: PropTypes.func.isRequired,
  loadTime: PropTypes.number.isRequired
};

export default withStyles(styles)(RecordList);
