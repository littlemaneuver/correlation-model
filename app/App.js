var React = require('react');
var Store = require('./Store.js');
var actions = require('./actions.js');
var TriggerChain = require('./components/trigger-chain/trigger-chain-view');
var Button = require('./components/button/button-view');
var LinearGraph = require('./components/linear-graph/linear-graph-view');
var classNames = require('classnames');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      triggerChain: Store.getChainConf(),
      triggerChainLength: Store.getChainConf()[0],
      sequence: Store.getSequence(),
      refSequence: Store.getRefSequence(),
      signal: Store.getSignal(),
      correlation: Store.getCorrelation(),
      maxStep: Store.getMaxStep(),
      hiddenButtons: Store.getHidden()
    };
  },
  componentWillMount: function () {
    Store.addChangeListener(this.changeState);
  },
  componentWillUnmount: function () {
    Store.removeChangeListener(this.changeState);
  },
  changeState: function () {
    this.setState({
      step: Store.getStep(),
      sequence: Store.getSequence(),
      isMSequence: Store.isMSequence(),
      newSequenceId: Store.getUniqueId(),
      hiddenButtons: Store.getHidden(),
      correlation: Store.getCorrelation()
    });
  },
  proceedChain: function () {
    actions.stepForward();
  },

  getWholeSequence: function () {
    actions.lastStep();
  },

  initSequence: function () {
    actions.initSequence();
  },

  render: function () {
    var self = this;
    var classes = classNames('sequence-wrapper', {
      'm-sequence': self.state.isMSequence
    });

    var hidden = classNames({
      'hidden': self.state.hiddenButtons
    });

    return (
      <div className="container">
        <TriggerChain chainLength={this.state.triggerChainLength} step={this.state.step} maxStep={this.state.maxStep} newSequenceId={this.state.newSequenceId}/>
        <div className={classes}>{this.state.sequence.join('')}</div>
        <Button name="Init chain with feedback" handler={this.initSequence}/>
        <div className={hidden}>
          <Button name="One step" handler={this.proceedChain}/>
          <Button name="Whole sequence" handler={this.getWholeSequence}/>
        </div>

        <LinearGraph data={this.state.correlation} width={800} height={400} updating={true}/>
        <LinearGraph data={this.state.signal} width={800} height={400}/>
      </div>
    );
  }

});
