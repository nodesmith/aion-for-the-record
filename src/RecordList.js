import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, CircularProgress, Grid, Typography } from '@material-ui/core';

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

    const spinner = (<CircularProgress />)

    return (
      <Grid container alignItems="center" direction="column">
        <Grid item xs={6} className={this.props.classes.header}>
          <Typography variant="h5">Messages in last 1000 blocks:</Typography>
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
};

export default withStyles(styles)(RecordList);
