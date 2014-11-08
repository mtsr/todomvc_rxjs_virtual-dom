'use strict';
/*
 * Renderer component.
 * Subscribes to vtree observables of all view components
 * and renders them as real DOM elements to the browser.
 */
var h = require('virtual-hyperscript');
var VDOM = {
  createElement: require('virtual-dom/create-element'),
  diff: require('virtual-dom/diff'),
  patch: require('virtual-dom/patch')
};
var DOMDelegator = require('dom-delegator');
var delegator = new DOMDelegator();

function renderVTreeStream(vtree$, containerSelector) {
  // Find and prepare the container
  var container = document.querySelector(containerSelector);
  if (container === null) {
    console.error('Couldn\'t render into unknown \'' + containerSelector + '\'');
    return false;
  }
  container.innerHTML = '';
  // Make the DOM node bound to the VDOM node
  var rootNode = document.createElement('div');
  container.appendChild(rootNode);
  vtree$.startWith(h())
    .bufferWithCount(2, 1)
    .subscribe(function(buffer) {
      try {
        var oldVTree = buffer[0];
        var newVTree = buffer[1];
        rootNode = VDOM.patch(rootNode, VDOM.diff(oldVTree, newVTree));
      } catch (err) {
        console.error(err);
      }
    }, function(err) {
      console.error(err.message);
    });
  return true;
}

module.exports = {
  render: renderVTreeStream
};