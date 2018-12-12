import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, Button, TextField, Dialog, DialogActions, DialogContent, FormControlLabel, DialogTitle, Switch } from '@material-ui/core';

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

class SettingsDialog extends Component {
  state = {
    newBlockCount: undefined,
    newEventCacheEnabled: undefined
  };

  handleSave = () => {
    this.props.closeSettingsDialog(this.getSettings());
    this.resetState();
  };

  handleCancel = () => {
    this.props.closeSettingsDialog(undefined);
    this.resetState();
  };

  resetState = () => {
    this.setState({
      newBlockCount: undefined,
      newEventCacheEnabled: undefined
    })
  }

  getSettings = () => {
    const blockCount = typeof this.state.newBlockCount !== 'undefined' ?
      this.state.newBlockCount : this.props.blockCount;

    const eventCacheEnabled = typeof this.state.newEventCacheEnabled !== 'undefined' ?
      this.state.newEventCacheEnabled : this.props.eventCacheEnabled;

    return {
      blockCount,
      eventCacheEnabled
    };
  }

  render() {
    const currentSettings = this.getSettings();

    return (
      <Dialog
        open={this.props.isOpen}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Event Cache Settings</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Number of Blocks to Search"
            type="number"
            fullWidth
            variant="outlined"
            value={currentSettings.blockCount}
            onChange={(event) => this.setState({newBlockCount: parseInt(event.target.value)})}
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentSettings.eventCacheEnabled}
                onChange={(event) => this.setState({newEventCacheEnabled: event.target.checked})}
                value="checkedB"
                color="primary"
              />
            }
            label="Enable Event Cache"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

SettingsDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  eventCacheEnabled: PropTypes.bool.isRequired,
  blockCount: PropTypes.number.isRequired,
  closeSettingsDialog: PropTypes.func.isRequired
};

export default withStyles(styles)(SettingsDialog);
