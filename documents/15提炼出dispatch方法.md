<br>

本篇体验把所有的dispatch方法提炼出来。

<br>

# 重构过滤条件 #

<br>

在设置过滤条件的时候，当前有如下：

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

<br>

把以上的dispatch方法提炼出来，变成如下：

<br>

	const setVisibilityFilter = (filter) => {
	  return {
	    type: 'SET_VISIBILITY_FILTER',
	    filter
	  };
	};
	
	...
	
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
	      dispatch(
	        setVisibilityFilter(ownProps.filter)
	      );
	    }
	  };
	}
	const FilterLink = connect(
	  mapStateToLinkProps,
	  mapDispatchToLinkProps
	)(Link);

<br>

# 重构添加列表项 #

<br>

当前是这样的：

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

重构后变成这样：

	let nextTodoId = 0;
	const addTodo = (text) => {
	  return {
	    type: 'ADD_TODO',
	    id: nextTodoId++,
	    text
	  };
	};
	
	...
	
	let AddTodo = ({ dispatch }) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        dispatch(addTodo(input.value));
	        input.value = '';
	      }}>
	        Add Todo
	      </button>
	    </div>
	  );
	};
	AddTodo = connect()(AddTodo);

<br>

# 重构VisibleTodoList #

<br>

当前是这样：

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

重构后变成这样：

	const toggleTodo = (id) => {
	  return {
	    type: 'TOGGLE_TODO',
	    id
	  };
	};
	
	...
	
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
	      dispatch(toggleTodo(id));
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
	
	let nextTodoId = 0;
	const addTodo = (text) => {
	  return {
	    type: 'ADD_TODO',
	    id: nextTodoId++,
	    text
	  };
	};
	
	const toggleTodo = (id) => {
	  return {
	    type: 'TOGGLE_TODO',
	    id
	  };
	};
	
	const setVisibilityFilter = (filter) => {
	  return {
	    type: 'SET_VISIBILITY_FILTER',
	    filter
	  };
	};
	
	
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
	      dispatch(
	        setVisibilityFilter(ownProps.filter)
	      );
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
	
	let AddTodo = ({ dispatch }) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        dispatch(addTodo(input.value));
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
	      dispatch(toggleTodo(id));
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












