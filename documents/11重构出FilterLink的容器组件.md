本篇继续重构FilterLink组件。当前是这样的：

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

以上，组件包含了html的展示以及事件。在实际项目中，通常把组件的表现和事件分开：一类组件只负责显示，叫做表现组件；一类组件是容器组件，把表现组件作为它的内嵌组件，还包括事件。

<br>

现在，Footer组件是这样的：

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

最终Footer组件这样被使用：

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

**问题在哪里呢？--问题在于：Footer组件需要关注的事情太多！如果写成`<Footer />`呢？**

<br>


我们首先重构出一个表现组件：

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

<br>

接着，来一个容器组件：

	class FilterLink extends Component {
	  componentDidMount() {
	    this.unsubscribe = store.subscribe(() =>
	      this.forceUpdate()
	    );
	  }
	  
	  componentWillUnmount() {
	    this.unsubscribe();
	  }
	  
	  render() {
	    const props = this.props;
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

这里，容器组件FilterLink不仅负责显示Link组件，而且把所有的事件都揽下了。这样做的好处是：当FilterLink被作为Footer组件的内嵌组件的时候，Footer的工作就变得简单了。而且，在componentDidMount和componentWillUnmount事件中，在createStore注册让FilterLink组件更新的事件，这样，一旦createStore中的状态有变化，也自动更新FilterLink组件的状态。

<br>

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

最终，在TodoApp这个组件中：

	<Footer />

<br>

> main.js, 完整代码：

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
	    this.unsubscribe = store.subscribe(() =>
	      this.forceUpdate()
	    );
	  }
	  
	  componentWillUnmount() {
	    this.unsubscribe();
	  }
	  
	  render() {
	    const props = this.props;
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
	    <Footer />
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







