'use strict';

var Rx = require('rx');
var h = require('virtual-hyperscript');
var replicate = require('../utils/replicate');

var modelTodos$ = new Rx.BehaviorSubject(null);
var modelCompleted$ = new Rx.BehaviorSubject(null);
var todosInput$ = new Rx.Subject();
var todoRemoveClick$ = new Rx.Subject();
var todoCompleteClick$ = new Rx.Subject();
var todoCompleteAllToggle$ = new Rx.Subject();

function observe(todosModel) {
  replicate(todosModel.todos$, modelTodos$);
  replicate(todosModel.completed$, modelCompleted$);
}

function vrenderHeader(todoModel) {
  return h('header#header', {}, [
    h('h1', {}, ['todos']),
    h('input#new-todo', {
      placeholder: "What needs to be done?",
      autofocus: true,
      'ev-keyup': function(ev) {
        switch (ev.keyCode) {
          case 13:
            todosInput$.onNext({
              event: ev,
              value: ev.currentTarget.value
            });
            // FALLTHROUGH
          case 27:
            ev.currentTarget.value = '';
            break;
          default:
        }
      }
    }, [])
  ]);
}

function vrenderItems(todoModel) {
  if (todoModel.length === 0) {
    return [];
  }

  return h('section#main', {}, [
    // TODO handle click
    h('input#toggle-all', {
      type: 'checkbox',
      'ev-click': function(ev) {
        todoCompleteAllToggle$.onNext({
          event: ev,
          completed: ev.currentTarget.checked
        });
      }
    }, []),
    h('label', {
      htmlFor: 'toggle-all'
    }, [
      'Mark all as complete'
    ]),
    h('ul#todo-list', {},
      todoModel.map(function(todoData) {
        // TODO handle edit
        return h('li' + (todoData.completed ? '.completed' : ''), {}, [
          h('.view', {}, [
            h('input.toggle', {
              type: 'checkbox',
              checked: todoData.completed,
              'ev-click': function(ev) {
                todoCompleteClick$.onNext({
                  event: ev,
                  todoId: todoData.id
                });
              }
            }, []),
            h('label', {}, [
              todoData.title
            ]),
            h('button.destroy', {
              'ev-click': function(ev) {
                todoRemoveClick$.onNext({
                  event: ev,
                  todoId: todoData.id
                });
              }
            }, [])
          ]),
          h('input.edit', {
            value: todoData.title
          }, [])
        ])
      })
    )
  ]);
}

function vrenderFooter(todoModel, completed) {
  if (todoModel.length === 0) {
    return null;
  }

  var activeCount = todoModel.length - completed;

  return h('footer#footer', {}, [
    h('span#todo-count', {}, [
      h('strong', {}, ['' + activeCount]),
      // TODO active count
      (activeCount) === 1 ? ' item left' : ' items left'
    ]),
    // // TODO routing
    // h('ul#filters', {}, [
    //   h('li', {}, [
    //     h('a.selected', {
    //       href: '#/'
    //     }, 'All')
    //   ]),
    //   h('li', {}, [
    //     h('a', {
    //       href: '#/active'
    //     }, 'Active')
    //   ]),
    //   h('li', {}, [
    //     h('a', {
    //       href: '#/completed'
    //     }, 'Completed')
    //   ])
    // ]),
    // TODO handle click
    (completed > 0 ? h('button#clear-completed', {}, 'Clear completed (' + completed + ')') : null)
  ]);
}

var vtree$ = modelTodos$
  .zip(modelCompleted$,
    function(todoModel, completed) {
      // console.log(arguments);
      return h('div', {}, [vrenderHeader(todoModel)]
        .concat(
          vrenderItems(todoModel))
        .concat([
          vrenderFooter(todoModel, completed)
        ])
      );
    }
  );

module.exports = {
  observe: observe,
  todosInput$: todosInput$,
  todoRemoveClick$: todoRemoveClick$,
  todoCompleteClick$: todoCompleteClick$,
  todoCompleteAllToggle$: todoCompleteAllToggle$,
  vtree$: vtree$
};