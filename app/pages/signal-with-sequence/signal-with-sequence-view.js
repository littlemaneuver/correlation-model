var React = require('react');
var Store = require('../../stores/cdma-store');
var MainStore = require('../../stores/main-store');
var actions = require('../../actions/cdma-actions');
var Button = require('../../ui-components/button/button-view');
var LinearGraph = require('../../ui-components/linear-graph/linear-graph-view');
var PrincipalSchema = require('../../ui-components/principal-schema/principal-schema-view');
var TriggerChain = require('../../ui-components/trigger-chain/trigger-chain-view');
var classNames = require('classnames');

module.exports = React.createClass({
  getInitialState: function () {
    return {
      signal: Store.getSignal(),
      sequence: Store.getSequence(),
      signalWithSequence: Store.getSignalWithSequence(),
      triggerChainLength: Store.getTriggerChainLength(),
      step: Store.getStep(),
      maxStep: Store.getMaxStep(),
      triggerValues: Store.getTriggerValues(),
      feedbackTriggers: Store.getFeedbackTriggers(),
      texts: MainStore.getTexts()
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
      signal: Store.getSignal(),
      sequence: Store.getSequence(),
      signalWithSequence: Store.getSignalWithSequence(),
      triggerChainLength: Store.getTriggerChainLength(),
      triggerValues: Store.getTriggerValues(),
      feedbackTriggers: Store.getFeedbackTriggers(),
      step: Store.getStep()
    });
  },

  proceedChain: function () {
    actions.stepForward();
  },

  render: function () {
    var self = this;

    var {signal, sequence, signalWithSequence, texts, triggerChainLength, step, maxStep, triggerValues, feedbackTriggers} = this.state;

    return (
      <div className="signal-with-sequence-container">
        <h2>{texts.signalWithSequence.heading}</h2>
        <p>{texts.signalWithSequence.introPart}</p>
        <PrincipalSchema highlighted={['data-generator', 'prn-generator', 'xor']}/>
        <LinearGraph data={signal} width={800} height={400} withoutBrush={true} emulateBars={true}/>
        <p className="text-center">{texts.signalWithSequence.signalCapture}</p>
        <p>{texts.signalWithSequence.aboutPRNCode}</p>
        <TriggerChain chainLength={triggerChainLength} step={step} maxStep={maxStep} newSequenceId={'static'} triggerValues={triggerValues} feedbackTriggers={feedbackTriggers} uneditable={true}/>

        <Button name="One step" handler={this.proceedChain}/>

        <LinearGraph data={sequence} width={800} height={400} emulateBars={true}/>
        <p className="text-center">{texts.signalWithSequence.PRNCapture}</p>
        <p>{texts.signalWithSequence.aboutMixingSignalWithPRN}</p>
        <LinearGraph data={signalWithSequence} width={800} height={400} emulateBars={true}/>
        <p className="text-center">{texts.signalWithSequence.signalWithSequenceCapture}</p>
      </div>
    );
  }

});
