import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, LinearProgress, Grid, Paper, TextField, Typography } from '@material-ui/core';

const styles = theme => ({
  lightTextColor: {
    color: '#eaeaea'
  },
  margin: {
    margin: theme.spacing.unit,
  },
  input: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    maxWidth: 600,
    marginTop: theme.spacing.unit * 4
  },
  root: {
    backgroundColor: '#282c34',
    padding:50
  },
  submit: {
    textAlign: 'center',
    marginBottom: 8
  }
});

/**
 * The record input component renders the form element that allows a user to 
 * write a message and submit that message.
 */
class RecordInput extends Component {
  constructor(props) {
    super(props);
    this.state = { message: '' };
  }

  /**
   * We limit the size of the input message to 140 characters.
   */
  handleNewMessage = (newMessage) => {
    if (newMessage.length <= 140) {
      this.setState({ message: newMessage });
    }
  }

  submitMessage = () => {
    this.props.submitMessage(this.state.message);
    this.setState({ message: '' });
  }

  render() {
    return (
      <Grid container alignItems="center" direction="column" className={this.props.classes.root}>
        <Grid item>
          <Typography variant="h4" className={this.props.classes.lightTextColor}>
            Say something for the record?
          </Typography>    
        </Grid>
        <Grid item>
          <Paper className={this.props.classes.paper} elevation={1}>
            <Typography variant="body1" align="center">
              Store a message (max of 140 characters) on the <a target="_blank" rel="noopener noreferrer" href="https://aion.network">Aion Network</a>.
              It will be immutably stored on the network forever.
              This app is open sourced and part of a <a target="_blank" rel="noopener noreferrer" href="https://medium.com/nodesmith-blog/for-the-record-a-web-app-starter-kit-built-on-aion-6dee39e1597b">developer tutorial</a>.
            </Typography>   
            <div>
             <TextField
                className={this.props.classes.input}
                id="outlined-multiline-flexible"
                label="For the record..."
                onChange={(event) => this.handleNewMessage(event.target.value)}
                value={this.state.message}
                multiline
                fullWidth
                rowsMax="4"
                margin="normal"
                variant="outlined"
              />
            </div>
            <div className={this.props.classes.submit}>
              <Button 
                variant="outlined" 
                color="primary"
                className={this.props.classes.button}
                onClick={this.submitMessage}
                disabled={this.state.message === ''}>
                Submit
               
              </Button>
            </div>
            {(this.props.submittingMessage) ? <LinearProgress /> : null }
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

RecordInput.propTypes = {
  classes: PropTypes.object.isRequired,
  submitMessage: PropTypes.func.isRequired,
  submittingMessage: PropTypes.bool.isRequired,
};

export default withStyles(styles)(RecordInput);
