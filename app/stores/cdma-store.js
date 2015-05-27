'use strict';
var flux = require('flux-react');
var actions = require('../actions/cdma-actions');
var _ = require('lodash');
var processTriggerChain = require('../processing/trigger-chain');
var signalHelpers = require('../processing/signal-helpers');


module.exports = (function () {

  var firstChain = [5, [2, 5]],
    firstSignal = [1, 0, 1, 1, 0],
    firstChainInAction = processTriggerChain(),
    secondRandomChain = [5, [3, 5]],
    secondSignal = [1, 1, 0, 1, 0],
    secondChainInAction = processTriggerChain(),
    dynamicChain = processTriggerChain(),
    carrier = signalHelpers.generateSin(10),
    firstRefSequence,
    secondRefSequence,
    firstSignalOnCarrier,
    secondSignalOnCarrier,
    firstSignalWithSequence,
    secondSignalWithSequence,
    mixedSignal,
    mixedSignalWithNoise;

  firstChainInAction.initChain.apply(firstChainInAction, firstChain);
  firstChainInAction.set();
  firstRefSequence = firstChainInAction.getSequence();

  secondChainInAction.initChain.apply(secondChainInAction, secondRandomChain);
  secondChainInAction.set();
  secondRefSequence = secondChainInAction.getSequence();


  dynamicChain.initChain.apply(dynamicChain, firstChain); //last trigger is always in the circuit
  dynamicChain.set();

  firstSignalWithSequence = signalHelpers.mixSignalWithMSequence(firstSignal, firstRefSequence);
  secondSignalWithSequence = signalHelpers.mixSignalWithMSequence(secondSignal, secondRefSequence);

  firstSignalOnCarrier = signalHelpers.addCarrier(signalHelpers.transformBinaryData(firstSignalWithSequence), carrier, carrier.length);

  secondSignalOnCarrier = signalHelpers.addCarrier(signalHelpers.transformBinaryData(secondSignalWithSequence), carrier, carrier.length);


  mixedSignal = signalHelpers.addSignals([
    firstSignalOnCarrier,
    secondSignalOnCarrier
  ], 9);

  mixedSignalWithNoise = signalHelpers.addRandomNoise(mixedSignal, 1);

  var firstSignalCorrelation = signalHelpers.multiplyWithCarrier(signalHelpers.correlation(mixedSignalWithNoise, signalHelpers.addCarrier(signalHelpers.transformBinaryData(firstRefSequence), carrier, carrier.length)), carrier);

  var secondSignalCorrelation = signalHelpers.multiplyWithCarrier(signalHelpers.correlation(mixedSignalWithNoise, signalHelpers.addCarrier(signalHelpers.transformBinaryData(secondRefSequence), carrier, carrier.length)), carrier);


  return flux.createStore({
    triggerChain: firstChain,
    signal: firstSignal,
    sequence: [],
    signalWithSequence: [],
    carrier: carrier,
    firstSignalOnCarrier: firstSignalOnCarrier,
    secondSignalOnCarrier: secondSignalOnCarrier,
    mixedSignal: mixedSignal,
    mixedSignalWithNoise: _.flatten(mixedSignalWithNoise),
    firstSignalCorrelation: firstSignalCorrelation,
    secondSignalCorrelation: secondSignalCorrelation,
    firstPhase: 0,
    secondPhase: 0,
    step: 0,
    maxStep: Math.pow(2, firstChain[0]) - 1,
    triggerChainLength: firstChain[0],
    triggerValues: dynamicChain.getChainSnapshot(),
    feedbackTriggers: firstChain[1],
    actions: [
      actions.stepForward,
      actions.updatePhaseFirstSignal,
      actions.updatePhaseSecondSignal
    ],

    calculateCorrelation: function () {
      if (this.sequence.length) {
        this.isMSequence = signalHelpers.isMSequence(this.sequence);
        this.correlation = signalHelpers.correlation(signalHelpers.transformBinaryData(this.signal), signalHelpers.transformBinaryData(this.sequence));
      }
    },

    updatePhaseFirstSignal: function (phase) {
      this.firstPhase = phase;
      this.firstSignalCorrelation = signalHelpers.multiplyWithCarrier(signalHelpers.correlation(mixedSignalWithNoise, signalHelpers.addCarrier(signalHelpers.transformBinaryData(firstRefSequence), carrier, carrier.length)), signalHelpers.generateSin(10, phase));
      this.emitChange();
    },

    updatePhaseSecondSignal: function (phase) {
      this.secondPhase = phase;
      this.secondSignalCorrelation = signalHelpers.multiplyWithCarrier(signalHelpers.correlation(mixedSignalWithNoise, signalHelpers.addCarrier(signalHelpers.transformBinaryData(secondRefSequence), carrier, carrier.length)), signalHelpers.generateSin(10, phase));
      this.emitChange();
    },


    stepForward: function () {
      if (this.step < this.maxStep) {
        this.step += 1;
        this.sequence.unshift(dynamicChain.moveValueThroughChain());
        this.triggerValues = dynamicChain.getChainSnapshot();
        this.signalWithSequence = signalHelpers.mixSignalWithMSequence(firstSignal, this.sequence);
        this.emitChange();
      }
    },

    exports: {
      getSignal: function () {
        return this.signal;
      },
      getSequence: function () {
        return this.sequence;
      },
      getSignalWithSequence: function () {
        return this.signalWithSequence;
      },
      getCarrier: function () {
        return this.carrier;
      },
      getFirstSignalOnCarrier: function () {
        return this.firstSignalOnCarrier;
      },
      getSecondSignalOnCarrier: function () {
        return this.secondSignalOnCarrier;
      },
      getCommonChannelSignal: function () {
        return this.mixedSignal;
      },
      getCommonChannelSignalWithNoise: function () {
        return this.mixedSignalWithNoise;
      },
      getFirstSignalCorrelation: function () {
        return this.firstSignalCorrelation;
      },
      getSecondSignalCorrelation: function () {
        return this.secondSignalCorrelation;
      },
      getFirstSignalPhase: function () {
        return this.firstPhase;
      },
      getSecondSignalPhase: function () {
        return this.secondPhase;
      },
      getTriggerValues: function () {
        return this.triggerValues;
      },
      getFeedbackTriggers: function () {
        return this.feedbackTriggers;
      },
      getStep: function () {
        return this.step;
      },
      getMaxStep: function () {
        return this.maxStep;
      },
      getTriggerChainLength: function () {
        return this.triggerChainLength;
      }
    }
  });
})();