<br>

本篇使用connect()重构。

<br>

> 首先导入

<br>

	import { Provider, connect } from 'react-redux';

<br>

# 重构FilterLink组件 #

<br>

在上一节中，FilterLink作为容器组件是这样定义的：

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

FilterLink组件做了如下的一些事情：

<br>

- 把Link组件中的active和state联系了起来，建立了映射
- 把Link组件中的onClick与dispatch联系了起来，建立了映射
- 处理了当state发生变化，重新更新FilterLink的事情
- 对上下文做了约束

<br>

其实，react-redux的connect方法就是做这个工作的。

	const mapStateToLinkProps = (
	  state,
	  ownProps
	) => {
	  return {
	    active:
	      ownProps.filter ===
	      state.visibilityFilter
	  };
	};
	const mapDispatchToLinkProps = (
	  dispatch,
	  ownProps
	) => {
	  return {
	    onClick: () => {
	      dispatch({
	        type: 'SET_VISIBILITY_FILTER',
	        filter: ownProps.filter
	      });
	    }
	  };
	}
	const FilterLink = connect(
	  mapStateToLinkProps,
	  mapDispatchToLinkProps
	)(Link);
- mapStateToLinkProps建立Link组件属性和state之间的映射
- mapDispatchToLinkProps建立Link组件和dispatch之间的映射

<br>


# 重构Addtodo组件 #

<br>

Addtodo组件当前是这样的：

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

<br>

使用connect()变成这样：

	let nextTodoId = 0;
	let AddTodo = ({ dispatch }) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        dispatch({
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
	AddTodo = connect()(AddTodo);

<br>

# 重构VisibleTodoList组件 #

<br>

VisibleTodoList组件当前是这样定义的：

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

使用connect()变成这样：

	const mapStateToTodoListProps = (
	  state
	) => {
	  return {
	    todos: getVisibleTodos(
	      state.todos,
	      state.visibilityFilter
	    )
	  };
	};
	const mapDispatchToTodoListProps = (
	  dispatch
	) => {
	  return {
	    onTodoClick: (id) => {
	      dispatch({
	        type: 'TOGGLE_TODO',
	        id
	      });
	    }
	  };
	};
	const VisibleTodoList = connect(
	  mapStateToTodoListProps,
	  mapDispatchToTodoListProps
	)(TodoList);

<br>

> main.js, 完整如下：

<br>

	import { createStore, combineReducers } from 'redux';
	import React, { Component } from 'react';
	import ReactDOM from 'react-dom';
	import { Provider, connect } from 'react-redux';
	
	
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
	
	const mapStateToLinkProps = (
	  state,
	  ownProps
	) => {
	  return {
	    active:
	      ownProps.filter ===
	      state.visibilityFilter
	  };
	};
	const mapDispatchToLinkProps = (
	  dispatch,
	  ownProps
	) => {
	  return {
	    onClick: () => {
	      dispatch({
	        type: 'SET_VISIBILITY_FILTER',
	        filter: ownProps.filter
	      });
	    }
	  };
	}
	const FilterLink = connect(
	  mapStateToLinkProps,
	  mapDispatchToLinkProps
	)(Link);
	
	const Footer = () => (
	  <p>
	    Show:
	    {' '}
	    <FilterLink filter='SHOW_ALL'>
	      All
	    </FilterLink>
	    {', '}
	    <FilterLink filter='SHOW_ACTIVE'>
	      Active
	    </FilterLink>
	    {', '}
	    <FilterLink filter='SHOW_COMPLETED'>
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
	let AddTodo = ({ dispatch }) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        dispatch({
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
	AddTodo = connect()(AddTodo);
	
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
	
	const mapStateToTodoListProps = (
	  state
	) => {
	  return {
	    todos: getVisibleTodos(
	      state.todos,
	      state.visibilityFilter
	    )
	  };
	};
	const mapDispatchToTodoListProps = (
	  dispatch
	) => {
	  return {
	    onTodoClick: (id) => {
	      dispatch({
	        type: 'TOGGLE_TODO',
	        id
	      });
	    }
	  };
	};
	const VisibleTodoList = connect(
	  mapStateToTodoListProps,
	  mapDispatchToTodoListProps
	)(TodoList);
	
	const TodoApp = () => (
	  <div>
	    <AddTodo />
	    <VisibleTodoList />
	    <Footer />
	  </div>
	);
	
	
	
	ReactDOM.render(
	  <Provider store={createStore(todoApp)}>
	    <TodoApp />
	  </Provider>,
	  document.getElementById('root')
	);

<br>






