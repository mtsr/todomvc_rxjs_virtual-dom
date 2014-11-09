'use strict';

var Rx = require('rx');
var replicate = require('../utils/replicate');

var todosInput$ = new Rx.Subject();
var todoRemoveClick$ = new Rx.Subject();
var todoCompleteClick$ = new Rx.Subject();
var todoCompleteAllToggle$ = new Rx.Subject();
var todoRemoveCompletedClick$ = new Rx.Subject();

function observe(todosView) {
  replicate(todosView.todosInput$, todosInput$);
  replicate(todosView.todoRemoveClick$, todoRemoveClick$);
  replicate(todosView.todoCompleteClick$, todoCompleteClick$);
  replicate(todosView.todoCompleteAllToggle$, todoCompleteAllToggle$);
  replicate(todosView.todoRemoveCompletedClick$, todoRemoveCompletedClick$);
}

var addTodo$ = todosInput$.map(function(object) {
  return {
    operation: 'add',
    todos: [{
      title: object.value
    }]
  }
});

var removeTodo$ = todoRemoveClick$.map(function(object) {
  return {
    operation: 'remove',
    id: object.todoId
  };
});

var completeTodo$ = todoCompleteClick$.map(function(object) {
  return {
    operation: 'complete',
    id: object.todoId
  };
});

var completeAllTodo$ = todoCompleteAllToggle$.map(function(object) {
  return {
    operation: 'completeAll',
    completed: object.completed
  };
});

var removeCompletedTodos$ = todoRemoveCompletedClick$.map(function(object) {
  return {
    operation: 'removeCompleted',
  };
});

module.exports = {
  observe: observe,
  addTodo$: addTodo$,
  removeTodo$: removeTodo$,
  completeTodo$: completeTodo$,
  completeAllTodo$: completeAllTodo$,
  removeCompletedTodos$: removeCompletedTodos$
};