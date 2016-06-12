import { createStore, combineReducers } from 'redux';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

//Reducer列表项，被Reducer列表引用
//这里的state是列表项，是一个对象
const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }

      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

//Reducer列表
//这里的state是对象数组
const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

//Reducer,显示所有和显示已完成之间切换
//这里的state是字符串
const visibilityFilter = (
  state = 'SHOW_ALL',
  action
) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};


//合并成一个Reducer,使用combineReducers
const todoApp = combineReducers({
   todos: todos,
    visibilityFilter: visibilityFilter
});

const store = createStore(todoApp);

let nextTodoId = 0;
class TodoApp extends Component{
    render(){
        return (
            <div>
                <input ref={node => {this.input = node;}} />
                <button onClick={() => {
                    store.dispatch({
                        type: 'ADD_TODO',
                        text: this.input.value,
                        id: nextTodoId++
                    });
            
                    this.input.value = '';
                }}>Add Todo</button>
                <ul>
                    {this.props.todos.map(todo => 
                        <li 
                            key={todo.id}
                            onClick={() => {
                                store.dispatch({type: 'TOGGLE_TODO', id: todo.id});
                            }}
                            style={{
                               textDecoration: todo.completed ? 'line-through' : 'none'
                            }}>{todo.text}</li>
                     )}
                </ul>
            </div>
        )
    }
}

const render = () => {
    ReactDOM.render(
        <TodoApp todos={store.getState().todos} />,
        document.getElementById('root')
    );
};

store.subscribe(render);
render();
