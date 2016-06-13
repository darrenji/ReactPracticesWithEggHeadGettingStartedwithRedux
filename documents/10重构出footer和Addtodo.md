# 重构出页脚 #

<br>

在上一节中，页脚的All, Active, Completed这三个按钮是由FilterLink这个组件生成的。代码如下：

    <p>
      Show:
      {' '}
      <FilterLink
        filter='SHOW_ALL'
        currentFilter={visibilityFilter}
      >
        All
      </FilterLink>
      {', '}
      <FilterLink
        filter='SHOW_ACTIVE'
        currentFilter={visibilityFilter}
      >
        Active
      </FilterLink>
      {', '}
      <FilterLink
        filter='SHOW_COMPLETED'
        currentFilter={visibilityFilter}
      >
        Completed
      </FilterLink>
    </p>

<br>

现在，要把以上的部分重构出一个Footer组件，也就是FilterLink成了Footer的内嵌组件。

<br>

首先是看FilterLink组件，当前是这样的：

	const FilterLink = ({
	  filter,
	  currentFilter,
	  children
	}) => {
	  if (filter === currentFilter) {
	    return <span>{children}</span>;
	  }
	
	  return (
	    <a href='#'
	       onClick={e => {
	         e.preventDefault();
	         store.dispatch({
	           type: 'SET_VISIBILITY_FILTER',
	           filter
	         });
	       }}
	    >
	      {children}
	    </a>
	  );
	};

<br>

以上的问题是：已经把onClick事件写死了，这样不好，因为我们想把FilterLink组件写成表现组件，尽量是松耦合，不能把这里写死。

<br>
于是写成：

	const FilterLink = ({
	  filter,
	  currentFilter,
	  children,
	  onClick
	}) => {
	  if (filter === currentFilter) {
	    return <span>{children}</span>;
	  }
	
	  return (
	    <a href='#'
	       onClick={e => {
	         e.preventDefault();
	         onClick(filter);
	       }}
	    >
	      {children}
	    </a>
	  );
	};

<br>

然后就到了Footer组件了：

	const Footer = ({
	  visibilityFilter,
	  onFilterClick
	}) => (
	  <p>
	    Show:
	    {' '}
	    <FilterLink
	      filter='SHOW_ALL'
	      currentFilter={visibilityFilter}
	      onClick={onFilterClick}
	    >
	      All
	    </FilterLink>
	    {', '}
	    <FilterLink
	      filter='SHOW_ACTIVE'
	      currentFilter={visibilityFilter}
	      onClick={onFilterClick}
	    >
	      Active
	    </FilterLink>
	    {', '}
	    <FilterLink
	      filter='SHOW_COMPLETED'
	      currentFilter={visibilityFilter}
	      onClick={onFilterClick}
	    >
	      Completed
	    </FilterLink>
	  </p>
	);

<br>

Footer组件所依赖的visibilityFilter和onFilterClick如何获取到呢？

<br>

    <Footer
      visibilityFilter={visibilityFilter}
      onFilterClick={filter =>
        store.dispatch({
          type: 'SET_VISIBILITY_FILTER',
          filter
        })
      }
    />

<br>

# 重构出Addtodo组件 #

<br>

添加列表项的部分，在上一节中是这样的：

    <input ref={node => {
      this.input = node;
    }} />
    <button onClick={() => {
      store.dispatch({
        type: 'ADD_TODO',
        text: this.input.value,
        id: nextTodoId++
      });
      this.input.value = '';
    }}>
      Add Todo
    </button>

显然，如果想重构出表现组件，这里的onClick部分不能写死。

<br>

	const AddTodo = ({
	  onAddClick
	}) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        onAddClick(input.value);
	        input.value = '';
	      }}>
	        Add Todo
	      </button>
	    </div>
	  );
	};

<br>

接着，AddTodo组件就作为TodoApp的内嵌组件。

    <AddTodo
      onAddClick={text =>
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text
        })
      }
    />

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
	
	
	const store = createStore(todoApp);
	
	
	const FilterLink = ({
	  filter,
	  currentFilter,
	  children,
	  onClick
	}) => {
	  if (filter === currentFilter) {
	    return <span>{children}</span>;
	  }
	
	  return (
	    <a href='#'
	       onClick={e => {
	         e.preventDefault();
	         onClick(filter);
	       }}
	    >
	      {children}
	    </a>
	  );
	};
	
	const Footer = ({
	  visibilityFilter,
	  onFilterClick
	}) => (
	  <p>
	    Show:
	    {' '}
	    <FilterLink
	      filter='SHOW_ALL'
	      currentFilter={visibilityFilter}
	      onClick={onFilterClick}
	    >
	      All
	    </FilterLink>
	    {', '}
	    <FilterLink
	      filter='SHOW_ACTIVE'
	      currentFilter={visibilityFilter}
	      onClick={onFilterClick}
	    >
	      Active
	    </FilterLink>
	    {', '}
	    <FilterLink
	      filter='SHOW_COMPLETED'
	      currentFilter={visibilityFilter}
	      onClick={onFilterClick}
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
	
	const AddTodo = ({
	  onAddClick
	}) => {
	  let input;
	
	  return (
	    <div>
	      <input ref={node => {
	        input = node;
	      }} />
	      <button onClick={() => {
	        onAddClick(input.value);
	        input.value = '';
	      }}>
	        Add Todo
	      </button>
	    </div>
	  );
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
	
	let nextTodoId = 0;
	const TodoApp = ({
	  todos,
	  visibilityFilter
	}) => (
	  <div>
	    <AddTodo
	      onAddClick={text =>
	        store.dispatch({
	          type: 'ADD_TODO',
	          id: nextTodoId++,
	          text
	        })
	      }
	    />
	    <TodoList
	      todos={
	        getVisibleTodos(
	          todos,
	          visibilityFilter
	        )
	      }
	      onTodoClick={id =>
	        store.dispatch({
	          type: 'TOGGLE_TODO',
	          id
	        })
	      }
	    />
	    <Footer
	      visibilityFilter={visibilityFilter}
	      onFilterClick={filter =>
	        store.dispatch({
	          type: 'SET_VISIBILITY_FILTER',
	          filter
	        })
	      }
	    />
	  </div>
	);
	
	const render = () => {
	  ReactDOM.render(
	    <TodoApp
	      {...store.getState()}
	    />,
	    document.getElementById('root')
	  );
	};
	
	store.subscribe(render);
	render();

<br>













