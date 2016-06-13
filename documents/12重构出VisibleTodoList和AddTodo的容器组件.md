# 重构出VisibleTodoList容器组件 #

<br>

来看目前Todolist组件被使用的：

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

TodoList组件还是关注的事情比较多，如果写成`<WrapperTodoList />`这样就好了。

<br>

首先，需要为Todolist组件外边包裹上一层，即创建一个容器组件。

	class VisibleTodoList extends Component {
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

在以上的VisibleTodoList组件中，不仅把TodoList渲染出来，还给TodoList组件的todos和onTodoClick两个属性赋了值。并且通过componentDidMount和componentWillUnmount事件，让一旦state状态有变化，就更新这里的VisibleTodoList组件。

<br>

# 重构出AddTodo容器组件 #

<br>

先看当前的Addtodo组件：

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

然后，Addtodo组件被这样使用：

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

可以看到，Addtodo组件的事件最终在TodoApp中被定义。我们应该把Addtodo设计成一个容器组件，让它自己解决很多事情。

<br>

	let nextTodoId = 0;
	const AddTodo = () => {
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

<br>

> main.js,完整如下：

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
	const AddTodo = () => {
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
	
	const TodoApp = () => (
	  <div>
	    <AddTodo />
	    <VisibleTodoList />
	    <Footer />
	  </div>
	);
	
	ReactDOM.render(
	  <TodoApp />,
	  document.getElementById('root')
	);

<br>








