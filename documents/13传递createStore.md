<br>

有时候，我们需要把createStore赋值给最外层的组件，然后需要把这个createStore传递给内嵌的组件，如何做呢？

<br>

# 使用Context隐式传递 #

<br>

首先来看如何渲染：

	ReactDOM.render(
	  <Provider store={createStore(todoApp)}>
	    <TodoApp />
	  </Provider>,
	  document.getElementById('root')
	);

也就是说，Provider是TodoApp组件的包裹组件，它不仅需要把TodoApp组件显示出来，还需要提供方法能返回createStore这个实例。

<br>

接着看Provider这个组件：

	class Provider extends Component {
	  getChildContext() {
	    return {
	      store: this.props.store
	    }; 
	  }
	
	  render() {
	    return this.props.children;
	  }
	}
	Provider.childContextTypes = {
	  store: React.PropTypes.object
	};

- 通过Provider的getChildContext方法，可以获取到createStore实例,存储在一个对象的store字段中
- store字段可以通过context.store获取
- 通过Provider的childContextTypes属性设置store字段的类型

<br>

最终，TodoApp组件和平常没有什么变化。如下：


	const TodoApp = () => (
	  <div>
	    <AddTodo />
	    <VisibleTodoList />
	    <Footer />
	  </div>
	);
但是，AddTodo, VisibleTodoList, Footer这3个组件却有不一样的设置。

<br>

先来看AddTodo组件：

	let nextTodoId = 0;
	const AddTodo = (props, { store }) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        store.dispatch({
	          type: 'ADD_TODO',
	          id: nextTodoId++,
	          text: input.value
	        })
	        input.value = '';
	      }}>
	        Add Todo
	      </button>
	    </div>
	  );
	};
	AddTodo.contextTypes = {
	  store: React.PropTypes.object
	};

这里的store,实际是从context.store中获取。

<br>

再来看FilterLink组件：

	class FilterLink extends Component {
	  componentDidMount() {
	    const { store } = this.context;
	    this.unsubscribe = store.subscribe(() =>
	      this.forceUpdate()
	    );
	  }
	  
	  componentWillUnmount() {
	    this.unsubscribe();
	  }
	  
	  render() {
	    const props = this.props;
	    const { store } = this.context;
	    const state = store.getState();
	    
	    return (
	      <Link
	        active={
	          props.filter ===
	          state.visibilityFilter
	        }
	        onClick={() =>
	          store.dispatch({
	            type: 'SET_VISIBILITY_FILTER',
	            filter: props.filter
	          })
	        }
	      >
	        {props.children}
	      </Link>
	    );
	  }
	}
	FilterLink.contextTypes = {
	  store: React.PropTypes.object
	};

<br>

最后看VisibleTodoList组件：

	class VisibleTodoList extends Component {
	  componentDidMount() {
	    const { store } = this.context;
	    this.unsubscribe = store.subscribe(() =>
	      this.forceUpdate()
	    );
	  }
	  
	  componentWillUnmount() {
	    this.unsubscribe();
	  }
	  
	  render() {
	    const props = this.props;
	    const { store } = this.context;
	    const state = store.getState();
	    
	    return (
	      <TodoList
	        todos={
	          getVisibleTodos(
	            state.todos,
	            state.visibilityFilter
	          )
	        }
	        onTodoClick={id =>
	          store.dispatch({
	            type: 'TOGGLE_TODO',
	            id
	          })            
	        }
	      />
	    );
	  }
	}
	VisibleTodoList.contextTypes = {
	  store: React.PropTypes.object
	};

<br>

> main.js, 完整如下：

<br>

	import { createStore, combineReducers } from 'redux';
	import React, { Component } from 'react';
	import ReactDOM from 'react-dom';
	
	
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
	
	const todos = (state = [], action) => {
	  switch (action.type) {
	    case 'ADD_TODO':
	      return [
	        ...state,
	        todo(undefined, action)
	      ];
	    case 'TOGGLE_TODO':
	      return state.map(t =>
	        todo(t, action)
	      );
	    default:
	      return state;
	  }
	};
	
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
	
	
	const todoApp = combineReducers({
	  todos,
	  visibilityFilter
	});
	
	
	const Link = ({
	  active,
	  children,
	  onClick
	}) => {
	  if (active) {
	    return <span>{children}</span>;
	  }
	
	  return (
	    <a href='#'
	       onClick={e => {
	         e.preventDefault();
	         onClick();
	       }}
	    >
	      {children}
	    </a>
	  );
	};
	
	class FilterLink extends Component {
	  componentDidMount() {
	    const { store } = this.context;
	    this.unsubscribe = store.subscribe(() =>
	      this.forceUpdate()
	    );
	  }
	  
	  componentWillUnmount() {
	    this.unsubscribe();
	  }
	  
	  render() {
	    const props = this.props;
	    const { store } = this.context;
	    const state = store.getState();
	    
	    return (
	      <Link
	        active={
	          props.filter ===
	          state.visibilityFilter
	        }
	        onClick={() =>
	          store.dispatch({
	            type: 'SET_VISIBILITY_FILTER',
	            filter: props.filter
	          })
	        }
	      >
	        {props.children}
	      </Link>
	    );
	  }
	}
	FilterLink.contextTypes = {
	  store: React.PropTypes.object
	};
	
	const Footer = () => (
	  <p>
	    Show:
	    {' '}
	    <FilterLink
	      filter='SHOW_ALL'
	    >
	      All
	    </FilterLink>
	    {', '}
	    <FilterLink
	      filter='SHOW_ACTIVE'
	    >
	      Active
	    </FilterLink>
	    {', '}
	    <FilterLink
	      filter='SHOW_COMPLETED'
	    >
	      Completed
	    </FilterLink>
	  </p>
	);
	
	const Todo = ({
	  onClick,
	  completed,
	  text
	}) => (
	  <li
	    onClick={onClick}
	    style={{
	      textDecoration:
	        completed ?
	          'line-through' :
	          'none'
	    }}
	  >
	    {text}
	  </li>
	);
	
	const TodoList = ({
	  todos,
	  onTodoClick
	}) => (
	  <ul>
	    {todos.map(todo =>
	      <Todo
	        key={todo.id}
	        {...todo}
	        onClick={() => onTodoClick(todo.id)}
	      />
	    )}
	  </ul>
	);
	
	let nextTodoId = 0;
	const AddTodo = (props, { store }) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        store.dispatch({
	          type: 'ADD_TODO',
	          id: nextTodoId++,
	          text: input.value
	        })
	        input.value = '';
	      }}>
	        Add Todo
	      </button>
	    </div>
	  );
	};
	AddTodo.contextTypes = {
	  store: React.PropTypes.object
	};
	
	const getVisibleTodos = (
	  todos,
	  filter
	) => {
	  switch (filter) {
	    case 'SHOW_ALL':
	      return todos;
	    case 'SHOW_COMPLETED':
	      return todos.filter(
	        t => t.completed
	      );
	    case 'SHOW_ACTIVE':
	      return todos.filter(
	        t => !t.completed
	      );
	  }
	}
	
	class VisibleTodoList extends Component {
	  componentDidMount() {
	    const { store } = this.context;
	    this.unsubscribe = store.subscribe(() =>
	      this.forceUpdate()
	    );
	  }
	  
	  componentWillUnmount() {
	    this.unsubscribe();
	  }
	  
	  render() {
	    const props = this.props;
	    const { store } = this.context;
	    const state = store.getState();
	    
	    return (
	      <TodoList
	        todos={
	          getVisibleTodos(
	            state.todos,
	            state.visibilityFilter
	          )
	        }
	        onTodoClick={id =>
	          store.dispatch({
	            type: 'TOGGLE_TODO',
	            id
	          })            
	        }
	      />
	    );
	  }
	}
	VisibleTodoList.contextTypes = {
	  store: React.PropTypes.object
	};
	
	const TodoApp = () => (
	  <div>
	    <AddTodo />
	    <VisibleTodoList />
	    <Footer />
	  </div>
	);
	
	class Provider extends Component {
	  getChildContext() {
	    return {
	      store: this.props.store
	    }; 
	  }
	
	  render() {
	    return this.props.children;
	  }
	}
	Provider.childContextTypes = {
	  store: React.PropTypes.object
	};
	
	
	
	ReactDOM.render(
	  <Provider store={createStore(todoApp)}>
	    <TodoApp />
	  </Provider>,
	  document.getElementById('root')
	);

<br>

# 使用react-redux的Provider传递 #

<br>

> npm install react-redux --save

<br>

> 引用

<br>

	import { Provider } from 'react-redux';

<br>

> 把以下删除掉或注释掉

<br>

	class Provider extends Component {
	  getChildContext() {
	    return {
	      store: this.props.store
	    }; 
	  }
	
	  render() {
	    return this.props.children;
	  }
	}
	Provider.childContextTypes = {
	  store: React.PropTypes.object
	};


















