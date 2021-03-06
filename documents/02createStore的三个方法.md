> main.js

<br>

	import { createStore } from 'redux';
	
	const counter = (state = 0, action) => {
	    switch(action.type){
	        case 'INCREMENT':
	            return state + 1;
	        case 'DECREMENT':
	            return state - 1;
	        default:
	            return state;
	    }
	}
	
	const store = createStore(counter);
	console.log(store.getState());



- redux为我们准备了`createStore`属性或对象
- createStore接受一个函数，该函数应该是一个所谓的pure function,在这里根据action维护着state
- `getState`方法获取state

<br>

> localhost:8080

<br>

**如何触动`createStore`中的方法呢？**

<br>

> main.js

<br>

	import { createStore } from 'redux';
	
	const counter = (state = 0, action) => {
	    switch(action.type){
	        case 'INCREMENT':
	            return state + 1;
	        case 'DECREMENT':
	            return state - 1;
	        default:
	            return state;
	    }
	}
	
	const store = createStore(counter);
	console.log(store.getState());
	
	store.dispatch({type: 'INCREMENT'});
	console.log(store.getState());

`dispatch`方法用来触发某个方法。

<br>

**如何把`createStore`中维护的状态和页面元素属性绑定起来呢？**

<br>

> main.js

<br>

	import { createStore } from 'redux';
	
	const counter = (state = 0, action) => {
	    switch(action.type){
	        case 'INCREMENT':
	            return state + 1;
	        case 'DECREMENT':
	            return state - 1;
	        default:
	            return state;
	    }
	}
	
	const store = createStore(counter);
	console.log(store.getState());
	
	store.subscribe(() => {
	    document.body.innerText = store.getState();
	});
	
	document.addEventListener('click', () => {
	    store.dispatch({type: 'INCREMENT'});
	});

- `subscribe`方法用来把状态和页面某个属性绑定起来
- 给页面添加点击事件，调用`dispatch`方法触发

<br>

当然，还可以把状态与页面元素属性绑定起来的过程封装起来。

<br>

	...
	
	const render = () => {
	    document.body.innerText = store.getState();
	};
	
	store.subscribe(render);
	render();
	
	document.addEventListener('click', () => {
	    store.dispatch({type: 'INCREMENT'});
	});

<br>

**`createStore`总结：**

<br>

- `getState`,获取状态
- `dispatch`，触发方法
- `subscribe`，注册状态和页面属性的绑定

<br>

**再来模拟一下`createStore`的工作原理。**

<br>

	const createStore = (reducer) => {
		let state;
		let listeners = [];

		const getState = () => state;

		const dispatch = (action) => {
			state = reducer(state, action);
			listeners.forEach(listener => listener());
		};

		const subscribe = (listener) => {
			listeners.push(listener);
			return () => {
				listeners = listeners.filter(l => l !== listener);
			};
		};

		dispatch({});

		return { getState, dispatch, subscribe };
	}

- `createStore`内部维护着状态和监听事件的一个数组
- 调用`dispatch`方法就是让reducer工作，原来上面例子中的counter方法就是reducer,reducer就是调用方法更新state.dispatch还触发所有的注册事件

<br>







