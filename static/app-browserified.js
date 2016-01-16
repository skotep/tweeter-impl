(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
;(function() {

var view = require('./view.js').get
var ctrl = require('./controller.js').get

//initialize the application
m.mount(document.getElementById('app'), { controller: ctrl, view: view })

})();
},{"./controller.js":2,"./view.js":3}],2:[function(require,module,exports){

exports.get = getController	

var MAX_TWEET_LENGTH = 140

var SERVER_POLLING_INTERVAL = 60000;

// model representation of a Tweet
function Tweet(data) {
	this.body = m.prop(data.body)
	this.author = m.prop(data.author)
	this.timestamp = m.prop(data.timestamp)
}

function getController() {	

	var vm = { 
		  tweets: []

		, loggedIn: false
		, username: m.prop("")

		, newTweetBody: m.prop("")		
		, error: m.prop("")

		, login: login
		, logout: logout

		, addTweet: addTweet
		, getTweets: getTweets
		, MAX_TWEET_LENGTH: MAX_TWEET_LENGTH
	}

	function login() {
		vm.loggedIn = vm.username().length > 0;
		vm.error(vm.loggedIn ? "" : "please enter a username")
		vm.newTweetBody("")
	}

	function logout() {
		vm.loggedIn = false;
		vm.username("")
		vm.error("")
		vm.newTweetBody("")
	}

	function getTweets(vm) {
		vm.error("")
		console.log('poll server...')

		var response = m.prop({})
		m.request({ method: 'GET', url: '/tweet'}).then(response).then(function() {
			var r = response()						
			if (r && r.tweets) {
				vm.tweets.length = 0
				r.tweets.forEach(function(twt) {					
					vm.tweets.unshift(new Tweet({ 
						author: twt.author,
						body: twt.body, 
						timestamp: twt.timestamp
					}))
				})
			}			
		})
	}

	function addTweet(vm) {
		vm.error("")
		var body = vm.newTweetBody()		
		var author = vm.username()		
		if (body) {
			if (body.length > MAX_TWEET_LENGTH) {
				window.alert('Content must be less than ' + MAX_TWEET_LENGTH + ' characters')
			} else {				
				var newTweet = new Tweet({ body: body, author: author })
				var response = m.prop({})
				var error = m.prop({})
				m.request({ method: 'PUT', url: '/tweet', data: newTweet }).then(response, error).then(function() {
					var e = error()
					var r = response()					
					if (!e || !e.error) {
						newTweet.timestamp(r.timestamp)
						vm.tweets.unshift(newTweet)		
						vm.newTweetBody("")
					} else {	
						vm.error(e.error ? e.error : e)
						console.log('there was an error', e.error)
					}
				})				
				
			}		
		}
	}

	function poll() {	
		getTweets(vm)
		setTimeout(poll, SERVER_POLLING_INTERVAL)
	}	
	poll()
	
	return vm
}

},{}],3:[function(require,module,exports){
/** @jsx m */

exports.get = xView

function xView(vm) {
    
    var navbar = {tag: "div", attrs: {class:"container-fluid"}, children: [
        {tag: "a", attrs: {class:"navbar-brand", href:"#"}, children: [
            {tag: "img", attrs: {class:"owl-icon", src:"./Rice_Owl_small.jpg"}}
        ]}, 
        {tag: "a", attrs: {class:"navbar-brand blue-text", href:"#"}, children: [
            "Tweeter"
        ]}, 
        {tag: "div", attrs: {class:"navbar-default pull-right"}, children: [
            
                vm.loggedIn ? 
                {tag: "input", attrs: {value: 'Welcome ' + vm.username() + '!', 
                    class:"navbar-default login-field welcome", 
                    readonly:true}} : 
                {tag: "input", attrs: {placeholder:"username", 
                    class:"navbar-default login-field", 
                    oninput: m.withAttr("value", vm.username) }}, 
            

            {tag: "button", attrs: {class:"btn btn-primary", 
                onclick: vm.loggedIn ? vm.logout : vm.login}, children: [
                 vm.loggedIn ? 'logout' : ' login'
            ]}
        ]}
    ]}

    var newTweet = {tag: "div", attrs: {class:"tweet"}, children: [
        {tag: "div", attrs: {class:"tweetbox", contenteditable:"true", 
            oninput: m.withAttr("innerText", vm.newTweetBody) }, children: [
             vm.newTweetBody() 
        ]}, 
            
        {tag: "div", attrs: {}, children: [
            {tag: "span", attrs: {class: (vm.newTweetBody() ? vm.newTweetBody().length : 0) > vm.MAX_TWEET_LENGTH ?
                "tweet tweetLength tweetRed" : "tweet tweetLength"}, children: [
                "Your tweet is ",  vm.newTweetBody() ? vm.newTweetBody().length : 0, " characters long"                    
            ]}, 
            {tag: "button", attrs: {class:"btn btn-success tweetBtn", onclick: function() { vm.addTweet(vm) }}, children: ["Tweet"]}
        ]}
    ]}

    ///////////////////////////////////////////////////////////////////////////
	return {tag: "div", attrs: {}, children: [

{tag: "nav", attrs: {class:"navbar navbar-default navbar-static-top"}, children: [
     navbar, 
     vm.loggedIn ? newTweet : {tag: "div", attrs: {class:"noTweet"}, children: ["login to make a tweet!"]}, 
    {tag: "div", attrs: {class:"alert alert-danger", style: vm.error().length ? 'display: block' : 'display: none'}, children: [
         vm.error() 
    ]}
]}, 


	vm.tweets.map(function(tweet, index) {       
		return {tag: "div", attrs: {class:"feed"}, children: [
			{tag: "span", attrs: {class:"author"}, children: [ tweet.author() ]}, 
            {tag: "span", attrs: {class:"timestamp"}, children: [ moment(tweet.timestamp()).fromNow() ]}, 
			{tag: "div", attrs: {}, children: [ tweet.body() ]}
		]}
	})


	]};
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
}


function mView(vm) {
    return m("html", [
    	m("head", [
    		m("link[href='style.css'][rel=stylesheet]")
  		]),
        m("body", [ 

        	m("input", {
        		placeholder: 'enter your name',
        		oninput: m.withAttr("value", vm.newTweetAuthor),
        	}, vm.newTweetAuthor()),

        	m("div", {
        		class: 'tweetbox',  
        		contenteditable:'true',
        		oninput: m.withAttr("innerText", vm.newTweetBody),        		
        	}, vm.newTweetBody()),
            
            m("div", { style: {
            	fontStyle: 'italic',
            	fontSize: '0.8em',
            	color: (vm.newTweetBody() ? vm.newTweetBody().length : 0) > vm.MAX_TWEET_LENGTH ? "red" : "black"
            } }, "Your tweet is " + (vm.newTweetBody() ? vm.newTweetBody().length : 0) + " characters long"),
            m("button", { onclick: function() { vm.addTweet(vm) } }, "Tweet"),

            m("table", [
               
            ])

        ]) // end html.body
    ])
} // end view


},{}]},{},[1,2,3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvYXBwLmpzIiwiYXBwL2NvbnRyb2xsZXIuanMiLCJhcHAvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7KGZ1bmN0aW9uKCkge1xuXG52YXIgdmlldyA9IHJlcXVpcmUoJy4vdmlldy5qcycpLmdldFxudmFyIGN0cmwgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXIuanMnKS5nZXRcblxuLy9pbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyksIHsgY29udHJvbGxlcjogY3RybCwgdmlldzogdmlldyB9KVxuXG59KSgpOyIsIlxuZXhwb3J0cy5nZXQgPSBnZXRDb250cm9sbGVyXHRcblxudmFyIE1BWF9UV0VFVF9MRU5HVEggPSAxNDBcblxudmFyIFNFUlZFUl9QT0xMSU5HX0lOVEVSVkFMID0gNjAwMDA7XG5cbi8vIG1vZGVsIHJlcHJlc2VudGF0aW9uIG9mIGEgVHdlZXRcbmZ1bmN0aW9uIFR3ZWV0KGRhdGEpIHtcblx0dGhpcy5ib2R5ID0gbS5wcm9wKGRhdGEuYm9keSlcblx0dGhpcy5hdXRob3IgPSBtLnByb3AoZGF0YS5hdXRob3IpXG5cdHRoaXMudGltZXN0YW1wID0gbS5wcm9wKGRhdGEudGltZXN0YW1wKVxufVxuXG5mdW5jdGlvbiBnZXRDb250cm9sbGVyKCkge1x0XG5cblx0dmFyIHZtID0geyBcblx0XHQgIHR3ZWV0czogW11cblxuXHRcdCwgbG9nZ2VkSW46IGZhbHNlXG5cdFx0LCB1c2VybmFtZTogbS5wcm9wKFwiXCIpXG5cblx0XHQsIG5ld1R3ZWV0Qm9keTogbS5wcm9wKFwiXCIpXHRcdFxuXHRcdCwgZXJyb3I6IG0ucHJvcChcIlwiKVxuXG5cdFx0LCBsb2dpbjogbG9naW5cblx0XHQsIGxvZ291dDogbG9nb3V0XG5cblx0XHQsIGFkZFR3ZWV0OiBhZGRUd2VldFxuXHRcdCwgZ2V0VHdlZXRzOiBnZXRUd2VldHNcblx0XHQsIE1BWF9UV0VFVF9MRU5HVEg6IE1BWF9UV0VFVF9MRU5HVEhcblx0fVxuXG5cdGZ1bmN0aW9uIGxvZ2luKCkge1xuXHRcdHZtLmxvZ2dlZEluID0gdm0udXNlcm5hbWUoKS5sZW5ndGggPiAwO1xuXHRcdHZtLmVycm9yKHZtLmxvZ2dlZEluID8gXCJcIiA6IFwicGxlYXNlIGVudGVyIGEgdXNlcm5hbWVcIilcblx0XHR2bS5uZXdUd2VldEJvZHkoXCJcIilcblx0fVxuXG5cdGZ1bmN0aW9uIGxvZ291dCgpIHtcblx0XHR2bS5sb2dnZWRJbiA9IGZhbHNlO1xuXHRcdHZtLnVzZXJuYW1lKFwiXCIpXG5cdFx0dm0uZXJyb3IoXCJcIilcblx0XHR2bS5uZXdUd2VldEJvZHkoXCJcIilcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFR3ZWV0cyh2bSkge1xuXHRcdHZtLmVycm9yKFwiXCIpXG5cdFx0Y29uc29sZS5sb2coJ3BvbGwgc2VydmVyLi4uJylcblxuXHRcdHZhciByZXNwb25zZSA9IG0ucHJvcCh7fSlcblx0XHRtLnJlcXVlc3QoeyBtZXRob2Q6ICdHRVQnLCB1cmw6ICcvdHdlZXQnfSkudGhlbihyZXNwb25zZSkudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdHZhciByID0gcmVzcG9uc2UoKVx0XHRcdFx0XHRcdFxuXHRcdFx0aWYgKHIgJiYgci50d2VldHMpIHtcblx0XHRcdFx0dm0udHdlZXRzLmxlbmd0aCA9IDBcblx0XHRcdFx0ci50d2VldHMuZm9yRWFjaChmdW5jdGlvbih0d3QpIHtcdFx0XHRcdFx0XG5cdFx0XHRcdFx0dm0udHdlZXRzLnVuc2hpZnQobmV3IFR3ZWV0KHsgXG5cdFx0XHRcdFx0XHRhdXRob3I6IHR3dC5hdXRob3IsXG5cdFx0XHRcdFx0XHRib2R5OiB0d3QuYm9keSwgXG5cdFx0XHRcdFx0XHR0aW1lc3RhbXA6IHR3dC50aW1lc3RhbXBcblx0XHRcdFx0XHR9KSlcblx0XHRcdFx0fSlcblx0XHRcdH1cdFx0XHRcblx0XHR9KVxuXHR9XG5cblx0ZnVuY3Rpb24gYWRkVHdlZXQodm0pIHtcblx0XHR2bS5lcnJvcihcIlwiKVxuXHRcdHZhciBib2R5ID0gdm0ubmV3VHdlZXRCb2R5KClcdFx0XG5cdFx0dmFyIGF1dGhvciA9IHZtLnVzZXJuYW1lKClcdFx0XG5cdFx0aWYgKGJvZHkpIHtcblx0XHRcdGlmIChib2R5Lmxlbmd0aCA+IE1BWF9UV0VFVF9MRU5HVEgpIHtcblx0XHRcdFx0d2luZG93LmFsZXJ0KCdDb250ZW50IG11c3QgYmUgbGVzcyB0aGFuICcgKyBNQVhfVFdFRVRfTEVOR1RIICsgJyBjaGFyYWN0ZXJzJylcblx0XHRcdH0gZWxzZSB7XHRcdFx0XHRcblx0XHRcdFx0dmFyIG5ld1R3ZWV0ID0gbmV3IFR3ZWV0KHsgYm9keTogYm9keSwgYXV0aG9yOiBhdXRob3IgfSlcblx0XHRcdFx0dmFyIHJlc3BvbnNlID0gbS5wcm9wKHt9KVxuXHRcdFx0XHR2YXIgZXJyb3IgPSBtLnByb3Aoe30pXG5cdFx0XHRcdG0ucmVxdWVzdCh7IG1ldGhvZDogJ1BVVCcsIHVybDogJy90d2VldCcsIGRhdGE6IG5ld1R3ZWV0IH0pLnRoZW4ocmVzcG9uc2UsIGVycm9yKS50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBlID0gZXJyb3IoKVxuXHRcdFx0XHRcdHZhciByID0gcmVzcG9uc2UoKVx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAoIWUgfHwgIWUuZXJyb3IpIHtcblx0XHRcdFx0XHRcdG5ld1R3ZWV0LnRpbWVzdGFtcChyLnRpbWVzdGFtcClcblx0XHRcdFx0XHRcdHZtLnR3ZWV0cy51bnNoaWZ0KG5ld1R3ZWV0KVx0XHRcblx0XHRcdFx0XHRcdHZtLm5ld1R3ZWV0Qm9keShcIlwiKVxuXHRcdFx0XHRcdH0gZWxzZSB7XHRcblx0XHRcdFx0XHRcdHZtLmVycm9yKGUuZXJyb3IgPyBlLmVycm9yIDogZSlcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd0aGVyZSB3YXMgYW4gZXJyb3InLCBlLmVycm9yKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdH1cdFx0XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gcG9sbCgpIHtcdFxuXHRcdGdldFR3ZWV0cyh2bSlcblx0XHRzZXRUaW1lb3V0KHBvbGwsIFNFUlZFUl9QT0xMSU5HX0lOVEVSVkFMKVxuXHR9XHRcblx0cG9sbCgpXG5cdFxuXHRyZXR1cm4gdm1cbn1cbiIsIi8qKiBAanN4IG0gKi9cblxuZXhwb3J0cy5nZXQgPSB4Vmlld1xuXG5mdW5jdGlvbiB4Vmlldyh2bSkge1xuICAgIFxuICAgIHZhciBuYXZiYXIgPSB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwiY29udGFpbmVyLWZsdWlkXCJ9LCBjaGlsZHJlbjogW1xuICAgICAgICB7dGFnOiBcImFcIiwgYXR0cnM6IHtjbGFzczpcIm5hdmJhci1icmFuZFwiLCBocmVmOlwiI1wifSwgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHt0YWc6IFwiaW1nXCIsIGF0dHJzOiB7Y2xhc3M6XCJvd2wtaWNvblwiLCBzcmM6XCIuL1JpY2VfT3dsX3NtYWxsLmpwZ1wifX1cbiAgICAgICAgXX0sIFxuICAgICAgICB7dGFnOiBcImFcIiwgYXR0cnM6IHtjbGFzczpcIm5hdmJhci1icmFuZCBibHVlLXRleHRcIiwgaHJlZjpcIiNcIn0sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICBcIlR3ZWV0ZXJcIlxuICAgICAgICBdfSwgXG4gICAgICAgIHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7Y2xhc3M6XCJuYXZiYXItZGVmYXVsdCBwdWxsLXJpZ2h0XCJ9LCBjaGlsZHJlbjogW1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdm0ubG9nZ2VkSW4gPyBcbiAgICAgICAgICAgICAgICB7dGFnOiBcImlucHV0XCIsIGF0dHJzOiB7dmFsdWU6ICdXZWxjb21lICcgKyB2bS51c2VybmFtZSgpICsgJyEnLCBcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6XCJuYXZiYXItZGVmYXVsdCBsb2dpbi1maWVsZCB3ZWxjb21lXCIsIFxuICAgICAgICAgICAgICAgICAgICByZWFkb25seTp0cnVlfX0gOiBcbiAgICAgICAgICAgICAgICB7dGFnOiBcImlucHV0XCIsIGF0dHJzOiB7cGxhY2Vob2xkZXI6XCJ1c2VybmFtZVwiLCBcbiAgICAgICAgICAgICAgICAgICAgY2xhc3M6XCJuYXZiYXItZGVmYXVsdCBsb2dpbi1maWVsZFwiLCBcbiAgICAgICAgICAgICAgICAgICAgb25pbnB1dDogbS53aXRoQXR0cihcInZhbHVlXCIsIHZtLnVzZXJuYW1lKSB9fSwgXG4gICAgICAgICAgICBcblxuICAgICAgICAgICAge3RhZzogXCJidXR0b25cIiwgYXR0cnM6IHtjbGFzczpcImJ0biBidG4tcHJpbWFyeVwiLCBcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiB2bS5sb2dnZWRJbiA/IHZtLmxvZ291dCA6IHZtLmxvZ2lufSwgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICAgICAgdm0ubG9nZ2VkSW4gPyAnbG9nb3V0JyA6ICcgbG9naW4nXG4gICAgICAgICAgICBdfVxuICAgICAgICBdfVxuICAgIF19XG5cbiAgICB2YXIgbmV3VHdlZXQgPSB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwidHdlZXRcIn0sIGNoaWxkcmVuOiBbXG4gICAgICAgIHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7Y2xhc3M6XCJ0d2VldGJveFwiLCBjb250ZW50ZWRpdGFibGU6XCJ0cnVlXCIsIFxuICAgICAgICAgICAgb25pbnB1dDogbS53aXRoQXR0cihcImlubmVyVGV4dFwiLCB2bS5uZXdUd2VldEJvZHkpIH0sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgdm0ubmV3VHdlZXRCb2R5KCkgXG4gICAgICAgIF19LCBcbiAgICAgICAgICAgIFxuICAgICAgICB7dGFnOiBcImRpdlwiLCBhdHRyczoge30sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICB7dGFnOiBcInNwYW5cIiwgYXR0cnM6IHtjbGFzczogKHZtLm5ld1R3ZWV0Qm9keSgpID8gdm0ubmV3VHdlZXRCb2R5KCkubGVuZ3RoIDogMCkgPiB2bS5NQVhfVFdFRVRfTEVOR1RIID9cbiAgICAgICAgICAgICAgICBcInR3ZWV0IHR3ZWV0TGVuZ3RoIHR3ZWV0UmVkXCIgOiBcInR3ZWV0IHR3ZWV0TGVuZ3RoXCJ9LCBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgIFwiWW91ciB0d2VldCBpcyBcIiwgIHZtLm5ld1R3ZWV0Qm9keSgpID8gdm0ubmV3VHdlZXRCb2R5KCkubGVuZ3RoIDogMCwgXCIgY2hhcmFjdGVycyBsb25nXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXX0sIFxuICAgICAgICAgICAge3RhZzogXCJidXR0b25cIiwgYXR0cnM6IHtjbGFzczpcImJ0biBidG4tc3VjY2VzcyB0d2VldEJ0blwiLCBvbmNsaWNrOiBmdW5jdGlvbigpIHsgdm0uYWRkVHdlZXQodm0pIH19LCBjaGlsZHJlbjogW1wiVHdlZXRcIl19XG4gICAgICAgIF19XG4gICAgXX1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRyZXR1cm4ge3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9LCBjaGlsZHJlbjogW1xuXG57dGFnOiBcIm5hdlwiLCBhdHRyczoge2NsYXNzOlwibmF2YmFyIG5hdmJhci1kZWZhdWx0IG5hdmJhci1zdGF0aWMtdG9wXCJ9LCBjaGlsZHJlbjogW1xuICAgICBuYXZiYXIsIFxuICAgICB2bS5sb2dnZWRJbiA/IG5ld1R3ZWV0IDoge3RhZzogXCJkaXZcIiwgYXR0cnM6IHtjbGFzczpcIm5vVHdlZXRcIn0sIGNoaWxkcmVuOiBbXCJsb2dpbiB0byBtYWtlIGEgdHdlZXQhXCJdfSwgXG4gICAge3RhZzogXCJkaXZcIiwgYXR0cnM6IHtjbGFzczpcImFsZXJ0IGFsZXJ0LWRhbmdlclwiLCBzdHlsZTogdm0uZXJyb3IoKS5sZW5ndGggPyAnZGlzcGxheTogYmxvY2snIDogJ2Rpc3BsYXk6IG5vbmUnfSwgY2hpbGRyZW46IFtcbiAgICAgICAgIHZtLmVycm9yKCkgXG4gICAgXX1cbl19LCBcblxuXG5cdHZtLnR3ZWV0cy5tYXAoZnVuY3Rpb24odHdlZXQsIGluZGV4KSB7ICAgICAgIFxuXHRcdHJldHVybiB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwiZmVlZFwifSwgY2hpbGRyZW46IFtcblx0XHRcdHt0YWc6IFwic3BhblwiLCBhdHRyczoge2NsYXNzOlwiYXV0aG9yXCJ9LCBjaGlsZHJlbjogWyB0d2VldC5hdXRob3IoKSBdfSwgXG4gICAgICAgICAgICB7dGFnOiBcInNwYW5cIiwgYXR0cnM6IHtjbGFzczpcInRpbWVzdGFtcFwifSwgY2hpbGRyZW46IFsgbW9tZW50KHR3ZWV0LnRpbWVzdGFtcCgpKS5mcm9tTm93KCkgXX0sIFxuXHRcdFx0e3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9LCBjaGlsZHJlbjogWyB0d2VldC5ib2R5KCkgXX1cblx0XHRdfVxuXHR9KVxuXG5cblx0XX07XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG59XG5cblxuZnVuY3Rpb24gbVZpZXcodm0pIHtcbiAgICByZXR1cm4gbShcImh0bWxcIiwgW1xuICAgIFx0bShcImhlYWRcIiwgW1xuICAgIFx0XHRtKFwibGlua1tocmVmPSdzdHlsZS5jc3MnXVtyZWw9c3R5bGVzaGVldF1cIilcbiAgXHRcdF0pLFxuICAgICAgICBtKFwiYm9keVwiLCBbIFxuXG4gICAgICAgIFx0bShcImlucHV0XCIsIHtcbiAgICAgICAgXHRcdHBsYWNlaG9sZGVyOiAnZW50ZXIgeW91ciBuYW1lJyxcbiAgICAgICAgXHRcdG9uaW5wdXQ6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCB2bS5uZXdUd2VldEF1dGhvciksXG4gICAgICAgIFx0fSwgdm0ubmV3VHdlZXRBdXRob3IoKSksXG5cbiAgICAgICAgXHRtKFwiZGl2XCIsIHtcbiAgICAgICAgXHRcdGNsYXNzOiAndHdlZXRib3gnLCAgXG4gICAgICAgIFx0XHRjb250ZW50ZWRpdGFibGU6J3RydWUnLFxuICAgICAgICBcdFx0b25pbnB1dDogbS53aXRoQXR0cihcImlubmVyVGV4dFwiLCB2bS5uZXdUd2VldEJvZHkpLCAgICAgICAgXHRcdFxuICAgICAgICBcdH0sIHZtLm5ld1R3ZWV0Qm9keSgpKSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbShcImRpdlwiLCB7IHN0eWxlOiB7XG4gICAgICAgICAgICBcdGZvbnRTdHlsZTogJ2l0YWxpYycsXG4gICAgICAgICAgICBcdGZvbnRTaXplOiAnMC44ZW0nLFxuICAgICAgICAgICAgXHRjb2xvcjogKHZtLm5ld1R3ZWV0Qm9keSgpID8gdm0ubmV3VHdlZXRCb2R5KCkubGVuZ3RoIDogMCkgPiB2bS5NQVhfVFdFRVRfTEVOR1RIID8gXCJyZWRcIiA6IFwiYmxhY2tcIlxuICAgICAgICAgICAgfSB9LCBcIllvdXIgdHdlZXQgaXMgXCIgKyAodm0ubmV3VHdlZXRCb2R5KCkgPyB2bS5uZXdUd2VldEJvZHkoKS5sZW5ndGggOiAwKSArIFwiIGNoYXJhY3RlcnMgbG9uZ1wiKSxcbiAgICAgICAgICAgIG0oXCJidXR0b25cIiwgeyBvbmNsaWNrOiBmdW5jdGlvbigpIHsgdm0uYWRkVHdlZXQodm0pIH0gfSwgXCJUd2VldFwiKSxcblxuICAgICAgICAgICAgbShcInRhYmxlXCIsIFtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXSlcblxuICAgICAgICBdKSAvLyBlbmQgaHRtbC5ib2R5XG4gICAgXSlcbn0gLy8gZW5kIHZpZXdcblxuIl19
