---
layout: post
title: Client Callable and Server Callable Script Includes
tags: [ServiceNow]
---

## The problem

Script Includes in ServiceNow, in a very simplistic explanation, is a server side script that can be called from other server scripts, making them great for re-usability.

Client callable script includes in ServiceNow are typically combined with an ServiceNow API method called GlideAjax. It's a method that handles the actual AJAX part of your script that sends and receives data between the client and the server.

Often, it's easier to think of these things separately, but for ease of use, there's often times we'd want to combine them.<!--endexcerpt-->

<a href="#solution">Click here to jump straight to the solution</a>

### Example of Server Callable Script Includes

Script Include:

<pre>
var <span style="color:blue">My_Functions</span> = Class.create();
<span style="color:blue">My_Functions</span>.prototype = {
    initialize: function() {
    },

	<span style="color:green">log_info</span>: function(<span style="color:red">x</span>) {
		gs.info(<span style="color:red">x</span>);
		return <span style="color:orange">'success'</span>;
	},
	
    type: 'My_Functions'
};

</pre>

Code that calls script include function:

<pre>
var y = new <span style="color:blue">My_Functions()</span>.<span style="color:green">log_info</span>(<span style="color:red">'Testing'</span>);

</pre>

- `y` would be set to <span style="color:orange">'success'</span>
- <span style="color:red">'Testing'</span> would be logged to the system (via gs.info())

### Example of Client Callable Script Includes

Script Include (Set `Client callable` to true):

<pre>
var <span style="color:blue">My_Functions</span> = Class.create();
<span style="color:blue">My_Functions</span>.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	<span style="color:green">log_info</span>: function(){
		var results = {};
		var <span style="color:red">x</span> = this.getParameter('<span style="color:purple">sysparm_x</span>');
		gs.info(<span style="color:red">x</span>);
		<span style="color:darkgray">results.message</span> = <span style="color:orange">'success'</span>;
		return JSON.stringify(result);
	},
	
    type: 'My_Functions'
});

</pre>

Code that calls the script include function:

<pre>
function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue == '') {
		return;
	}

	var ga = new GlideAjax('<span style="color:blue">My_Functions</span>'); 
	ga.addParam('sysparm_name','<span style="color:green">log_info</span>'); 
	ga.addParam('<span style="color:purple">sysparm_x</span>', <span style="color:red">'Testing'</span>); 
	ga.getXML(ResponseFunction); 
	
	function ResponseFunction(response) { 
		var answer = response.responseXML.documentElement.getAttribute("answer"); 
		var results = JSON.parse(answer);
		alert(<span style="color:darkgray">results.message</span>);
	}
}

</pre>

- An alert window would appear with the value of <span style="color:darkgray">results.message</span> which would be <span style="color:orange">'success'</span>
- <span style="color:red">'Testing'</span> would be logged to the system (via gs.info())


### <span id="solution">Example of a single combined Script include</span>

Script include (note the small changes in bold from the example client-callable script include):

<pre>
var <span style="color:blue">My_Functions</span> = Class.create();
<span style="color:blue">My_Functions</span>.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	<span style="color:green">log_info</span>: function(<b>x0</b>){
		var results = {};
		var <span style="color:red">x</span> = this.getParameter('<span style="color:purple">sysparm_x</span>') <b>|| x0</b>;
		gs.info(<span style="color:red">x</span>);
		<span style="color:darkgray">results.message</span> = <span style="color:orange">'success'</span>;
		return JSON.stringify(results);
	},
	
    type: 'My_Functions'
});

</pre>

Because of the small changes:
- When called from client, it still sets `x` according to the `.getParameter()` function
- When called from server, if passed a parameter, it first passes to the function then gets set to `x` because of the lack of parameters to retrieve.

Presto, a single function with parameters that can now be called either way.