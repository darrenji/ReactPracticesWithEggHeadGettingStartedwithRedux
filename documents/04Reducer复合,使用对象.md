本篇需要用到ES6中的Spread operator,并且用到对象上，需要安装一个插件。

<br>

> npm install babel-plugin-transform-object-rest-spread --save

<br>

> webpack.config.js

<br>

	module.exports = {
	    entry: './main.js',
	    output: {
	        path: './',
	        filename: 'index.js'
	    },
	    module: {
	        loaders: [
	            {
	                test: /\.js$/,
	                exclude: /node_modules/,
	                loader: 'babel',
	                query: {
	                    presets: ['es2015', 'react'],
	                    "plugins": ["transform-object-rest-spread"]
	                }
	            }
	        ]
	    }
	}

<br>

> main.js

<br>

	import { createStore } from 'redux';
	import React from 'react';
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
	
	//合并成一个Reducer
	const todoApp = (state = {}, action) => {
	  return {
	    todos: todos(
	      state.todos,
	      action
	    ),
	    visibilityFilter: visibilityFilter(
	      state.visibilityFilter,
	      action
	    )
	  };
	};
	
	const store = createStore(todoApp);
	
	console.log('Initial state:');
	console.log(store.getState());
	console.log('--------------');
	
	console.log('Dispatching ADD_TODO.');
	store.dispatch({
	  type: 'ADD_TODO',
	  id: 0,
	  text: 'Learn Redux'
	});
	console.log('Current state:');
	console.log(store.getState());
	console.log('--------------');
	
	console.log('Dispatching ADD_TODO.');
	store.dispatch({
	  type: 'ADD_TODO',
	  id: 1,
	  text: 'Go shopping'
	});
	console.log('Current state:');
	console.log(store.getState());
	console.log('--------------');
	
	console.log('Dispatching TOGGLE_TODO.');
	store.dispatch({
	  type: 'TOGGLE_TODO',
	  id: 0
	});
	console.log('Current state:');
	console.log(store.getState());
	console.log('--------------');
	
	console.log('Dispatching SET_VISIBILITY_FILTER');
	store.dispatch({
	  type: 'SET_VISIBILITY_FILTER',
	  filter: 'SHOW_COMPLETED'
	});
	console.log('Current state:');
	console.log(store.getState());
	console.log('--------------');

<br>

> localhost:8080

<br>

