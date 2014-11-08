'use strict';

var Rx = require('rx');
var replicate = require('../utils/replicate');
var uuid = require('../utils/uuid');
var _ = require('lodash');

var intentAddTodo$ = new Rx.Subject();
var intentRemoveTodo$ = new Rx.Subject();
var intentCompleteTodo$ = new Rx.Subject();

function observe(todosIntent) {
  replicate(todosIntent.addTodo$, intentAddTodo$);
  replicate(todosIntent.removeTodo$, intentRemoveTodo$);
  replicate(todosIntent.completeTodo$, intentCompleteTodo$);
}

var todos$ = Rx.Observable.just([
    // TODO load from localstorage
    // {
    //   id: uuid(),
    // }
  ])
  .merge(intentAddTodo$)
  .merge(intentRemoveTodo$)
  .merge(intentCompleteTodo$)
  .scan(function(todos, intent) {
    switch (intent.operation) {
      case 'add':
        intent.todos.map(function(todo) {
          todo.id = uuid();
        });
        return todos.concat(intent.todos);
      case 'remove':
        for (var ii = 0; ii < todos.length; ++ii) {
          if (todos[ii].id === intent.id) {
            todos.splice(ii, 1);
            break;
          }
        }
        return todos;
      case 'complete':
        for (var ii = 0; ii < todos.length; ++ii) {
          if (todos[ii].id === intent.id) {
            // TODO need to clone todo because operations need to be side-effect free. Although todos[] is not shared, the todos in it are and mutating them thus is/has sideeffects. Another solution is 'share()', making sure side-effects occur only once.
            todos[ii] = _.clone(todos[ii]);
            todos[ii].completed = !!!todos[ii].completed;
            break;
          }
        }
        return todos;
      default:
        console.error('unrecognized intent');
    }
  });

var completed$ = todos$.map(function(todos) {
  var completed = 0;
  for (var ii = 0; ii < todos.length; ++ii) {
    if (todos[ii].completed) {
      ++completed;
    }
  }
  return completed;
});

module.exports = {
  observe: observe,
  todos$: todos$,
  completed$: completed$
};