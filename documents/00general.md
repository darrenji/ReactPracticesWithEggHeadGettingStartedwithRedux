<br>

http://redux.js.org/

<br>

Redux是用来管理React应用程序的state的。Redux使用从Facebook的Flus进化而来。使用Redux可能会让React应用程序管理起来更简单，但也不是要求每个React应用程序都使用Redux。

<br>

在Redux中，每一次调用方法，叫做dispatching action, dispaching action是一个对象，是一个Plain Object, 就像如下：

	{
		filter: "SHOW_ACTIVE",
		type: "SET_VISIBILITY_FILTER"
	}

<br>

**Pure functions和Impure functions**

<br>

Pure functions就像如下：

	function square(x){
		return x * x;
	}

	function squareAll(items){
		return items.map(square);
	}
每次给它相同的参数，得到相同的结果。

<br>

Impure functions就像如下：

	function square(x){
		updateXInDatabase(x);
		return x * x;
	}

	function squareAll(items){
		for(let i = 0; i < items.length; i++){
			items[i] = square(items[i]);
		}
	}

以上，由于和数据库有了交互，所以，每次给它相同的参数，得到的结果可能是不一样的。
<br>

**在React中，尽量写成pure function的时候比较多。**

<br>

Redux中还有一个**Reducer Function**的概念，这就是pure function，用来处理上一次和下一次的状态。Reducer Function处理的对象类似如下：

	{
		"initial state:" : 0,
		"previous state:"； 0，
		“dispatching action:”: {
			type: "INCREMENT"
		},
		"next state:": 1
	}




