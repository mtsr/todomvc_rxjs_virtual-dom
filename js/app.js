(function(window) {
  'use strict';

  var renderer = require('./renderer');

  var todosModel = require('./models/todos');
  var todosView = require('./views/todos');
  var todosIntent = require('./intents/todos');

  todosView.observe(todosModel);
  todosIntent.observe(todosView);
  todosModel.observe(todosIntent);
  renderer.render(todosView.vtree$, '#todoapp');
})(window);