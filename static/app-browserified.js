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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvYXBwLmpzIiwiYXBwL2NvbnRyb2xsZXIuanMiLCJhcHAvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiOyhmdW5jdGlvbigpIHtcblxudmFyIHZpZXcgPSByZXF1aXJlKCcuL3ZpZXcuanMnKS5nZXRcbnZhciBjdHJsID0gcmVxdWlyZSgnLi9jb250cm9sbGVyLmpzJykuZ2V0XG5cbi8vaW5pdGlhbGl6ZSB0aGUgYXBwbGljYXRpb25cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FwcCcpLCB7IGNvbnRyb2xsZXI6IGN0cmwsIHZpZXc6IHZpZXcgfSlcblxufSkoKTsiLCJcbmV4cG9ydHMuZ2V0ID0gZ2V0Q29udHJvbGxlclx0XG5cbnZhciBNQVhfVFdFRVRfTEVOR1RIID0gMTQwXG5cbnZhciBTRVJWRVJfUE9MTElOR19JTlRFUlZBTCA9IDYwMDAwO1xuXG4vLyBtb2RlbCByZXByZXNlbnRhdGlvbiBvZiBhIFR3ZWV0XG5mdW5jdGlvbiBUd2VldChkYXRhKSB7XG5cdHRoaXMuYm9keSA9IG0ucHJvcChkYXRhLmJvZHkpXG5cdHRoaXMuYXV0aG9yID0gbS5wcm9wKGRhdGEuYXV0aG9yKVxuXHR0aGlzLnRpbWVzdGFtcCA9IG0ucHJvcChkYXRhLnRpbWVzdGFtcClcbn1cblxuZnVuY3Rpb24gZ2V0Q29udHJvbGxlcigpIHtcdFxuXG5cdHZhciB2bSA9IHsgXG5cdFx0ICB0d2VldHM6IFtdXG5cblx0XHQsIGxvZ2dlZEluOiBmYWxzZVxuXHRcdCwgdXNlcm5hbWU6IG0ucHJvcChcIlwiKVxuXG5cdFx0LCBuZXdUd2VldEJvZHk6IG0ucHJvcChcIlwiKVx0XHRcblx0XHQsIGVycm9yOiBtLnByb3AoXCJcIilcblxuXHRcdCwgbG9naW46IGxvZ2luXG5cdFx0LCBsb2dvdXQ6IGxvZ291dFxuXG5cdFx0LCBhZGRUd2VldDogYWRkVHdlZXRcblx0XHQsIGdldFR3ZWV0czogZ2V0VHdlZXRzXG5cdFx0LCBNQVhfVFdFRVRfTEVOR1RIOiBNQVhfVFdFRVRfTEVOR1RIXG5cdH1cblxuXHRmdW5jdGlvbiBsb2dpbigpIHtcblx0XHR2bS5sb2dnZWRJbiA9IHZtLnVzZXJuYW1lKCkubGVuZ3RoID4gMDtcblx0XHR2bS5lcnJvcih2bS5sb2dnZWRJbiA/IFwiXCIgOiBcInBsZWFzZSBlbnRlciBhIHVzZXJuYW1lXCIpXG5cdFx0dm0ubmV3VHdlZXRCb2R5KFwiXCIpXG5cdH1cblxuXHRmdW5jdGlvbiBsb2dvdXQoKSB7XG5cdFx0dm0ubG9nZ2VkSW4gPSBmYWxzZTtcblx0XHR2bS51c2VybmFtZShcIlwiKVxuXHRcdHZtLmVycm9yKFwiXCIpXG5cdFx0dm0ubmV3VHdlZXRCb2R5KFwiXCIpXG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUd2VldHModm0pIHtcblx0XHR2bS5lcnJvcihcIlwiKVxuXHRcdGNvbnNvbGUubG9nKCdwb2xsIHNlcnZlci4uLicpXG5cblx0XHR2YXIgcmVzcG9uc2UgPSBtLnByb3Aoe30pXG5cdFx0bS5yZXF1ZXN0KHsgbWV0aG9kOiAnR0VUJywgdXJsOiAnL3R3ZWV0J30pLnRoZW4ocmVzcG9uc2UpLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgciA9IHJlc3BvbnNlKClcdFx0XHRcdFx0XHRcblx0XHRcdGlmIChyICYmIHIudHdlZXRzKSB7XG5cdFx0XHRcdHZtLnR3ZWV0cy5sZW5ndGggPSAwXG5cdFx0XHRcdHIudHdlZXRzLmZvckVhY2goZnVuY3Rpb24odHd0KSB7XHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZtLnR3ZWV0cy51bnNoaWZ0KG5ldyBUd2VldCh7IFxuXHRcdFx0XHRcdFx0YXV0aG9yOiB0d3QuYXV0aG9yLFxuXHRcdFx0XHRcdFx0Ym9keTogdHd0LmJvZHksIFxuXHRcdFx0XHRcdFx0dGltZXN0YW1wOiB0d3QudGltZXN0YW1wXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdH0pXG5cdFx0XHR9XHRcdFx0XG5cdFx0fSlcblx0fVxuXG5cdGZ1bmN0aW9uIGFkZFR3ZWV0KHZtKSB7XG5cdFx0dm0uZXJyb3IoXCJcIilcblx0XHR2YXIgYm9keSA9IHZtLm5ld1R3ZWV0Qm9keSgpXHRcdFxuXHRcdHZhciBhdXRob3IgPSB2bS51c2VybmFtZSgpXHRcdFxuXHRcdGlmIChib2R5KSB7XG5cdFx0XHRpZiAoYm9keS5sZW5ndGggPiBNQVhfVFdFRVRfTEVOR1RIKSB7XG5cdFx0XHRcdHdpbmRvdy5hbGVydCgnQ29udGVudCBtdXN0IGJlIGxlc3MgdGhhbiAnICsgTUFYX1RXRUVUX0xFTkdUSCArICcgY2hhcmFjdGVycycpXG5cdFx0XHR9IGVsc2Uge1x0XHRcdFx0XG5cdFx0XHRcdHZhciBuZXdUd2VldCA9IG5ldyBUd2VldCh7IGJvZHk6IGJvZHksIGF1dGhvcjogYXV0aG9yIH0pXG5cdFx0XHRcdHZhciByZXNwb25zZSA9IG0ucHJvcCh7fSlcblx0XHRcdFx0dmFyIGVycm9yID0gbS5wcm9wKHt9KVxuXHRcdFx0XHRtLnJlcXVlc3QoeyBtZXRob2Q6ICdQVVQnLCB1cmw6ICcvdHdlZXQnLCBkYXRhOiBuZXdUd2VldCB9KS50aGVuKHJlc3BvbnNlLCBlcnJvcikudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgZSA9IGVycm9yKClcblx0XHRcdFx0XHR2YXIgciA9IHJlc3BvbnNlKClcdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKCFlIHx8ICFlLmVycm9yKSB7XG5cdFx0XHRcdFx0XHRuZXdUd2VldC50aW1lc3RhbXAoci50aW1lc3RhbXApXG5cdFx0XHRcdFx0XHR2bS50d2VldHMudW5zaGlmdChuZXdUd2VldClcdFx0XG5cdFx0XHRcdFx0XHR2bS5uZXdUd2VldEJvZHkoXCJcIilcblx0XHRcdFx0XHR9IGVsc2Uge1x0XG5cdFx0XHRcdFx0XHR2bS5lcnJvcihlLmVycm9yID8gZS5lcnJvciA6IGUpXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygndGhlcmUgd2FzIGFuIGVycm9yJywgZS5lcnJvcilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHR9XHRcdFxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHBvbGwoKSB7XHRcblx0XHRnZXRUd2VldHModm0pXG5cdFx0c2V0VGltZW91dChwb2xsLCBTRVJWRVJfUE9MTElOR19JTlRFUlZBTClcblx0fVx0XG5cdHBvbGwoKVxuXHRcblx0cmV0dXJuIHZtXG59XG4iLCIvKiogQGpzeCBtICovXG5cbmV4cG9ydHMuZ2V0ID0geFZpZXdcblxuZnVuY3Rpb24geFZpZXcodm0pIHtcbiAgICBcbiAgICB2YXIgbmF2YmFyID0ge3RhZzogXCJkaXZcIiwgYXR0cnM6IHtjbGFzczpcImNvbnRhaW5lci1mbHVpZFwifSwgY2hpbGRyZW46IFtcbiAgICAgICAge3RhZzogXCJhXCIsIGF0dHJzOiB7Y2xhc3M6XCJuYXZiYXItYnJhbmRcIiwgaHJlZjpcIiNcIn0sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICB7dGFnOiBcImltZ1wiLCBhdHRyczoge2NsYXNzOlwib3dsLWljb25cIiwgc3JjOlwiLi9SaWNlX093bF9zbWFsbC5qcGdcIn19XG4gICAgICAgIF19LCBcbiAgICAgICAge3RhZzogXCJhXCIsIGF0dHJzOiB7Y2xhc3M6XCJuYXZiYXItYnJhbmQgYmx1ZS10ZXh0XCIsIGhyZWY6XCIjXCJ9LCBjaGlsZHJlbjogW1xuICAgICAgICAgICAgXCJUd2VldGVyXCJcbiAgICAgICAgXX0sIFxuICAgICAgICB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwibmF2YmFyLWRlZmF1bHQgcHVsbC1yaWdodFwifSwgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZtLmxvZ2dlZEluID8gXG4gICAgICAgICAgICAgICAge3RhZzogXCJpbnB1dFwiLCBhdHRyczoge3ZhbHVlOiAnV2VsY29tZSAnICsgdm0udXNlcm5hbWUoKSArICchJywgXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOlwibmF2YmFyLWRlZmF1bHQgbG9naW4tZmllbGQgd2VsY29tZVwiLCBcbiAgICAgICAgICAgICAgICAgICAgcmVhZG9ubHk6dHJ1ZX19IDogXG4gICAgICAgICAgICAgICAge3RhZzogXCJpbnB1dFwiLCBhdHRyczoge3BsYWNlaG9sZGVyOlwidXNlcm5hbWVcIiwgXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOlwibmF2YmFyLWRlZmF1bHQgbG9naW4tZmllbGRcIiwgXG4gICAgICAgICAgICAgICAgICAgIG9uaW5wdXQ6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCB2bS51c2VybmFtZSkgfX0sIFxuICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHt0YWc6IFwiYnV0dG9uXCIsIGF0dHJzOiB7Y2xhc3M6XCJidG4gYnRuLXByaW1hcnlcIiwgXG4gICAgICAgICAgICAgICAgb25jbGljazogdm0ubG9nZ2VkSW4gPyB2bS5sb2dvdXQgOiB2bS5sb2dpbn0sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgIHZtLmxvZ2dlZEluID8gJ2xvZ291dCcgOiAnIGxvZ2luJ1xuICAgICAgICAgICAgXX1cblxuXG4gICAgICAgIF19XG4gICAgXX1cblxuICAgIHZhciBuZXdUd2VldCA9IHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7Y2xhc3M6XCJ0d2VldFwifSwgY2hpbGRyZW46IFtcbiAgICAgICAge3RhZzogXCJkaXZcIiwgYXR0cnM6IHtjbGFzczpcInR3ZWV0Ym94XCIsIGNvbnRlbnRlZGl0YWJsZTpcInRydWVcIiwgXG4gICAgICAgICAgICBvbmlucHV0OiBtLndpdGhBdHRyKFwiaW5uZXJUZXh0XCIsIHZtLm5ld1R3ZWV0Qm9keSkgfSwgY2hpbGRyZW46IFtcbiAgICAgICAgICAgICB2bS5uZXdUd2VldEJvZHkoKSBcbiAgICAgICAgXX0sIFxuICAgICAgICAgICAgXG4gICAgICAgIHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7fSwgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIHt0YWc6IFwic3BhblwiLCBhdHRyczoge2NsYXNzOiAodm0ubmV3VHdlZXRCb2R5KCkgPyB2bS5uZXdUd2VldEJvZHkoKS5sZW5ndGggOiAwKSA+IHZtLk1BWF9UV0VFVF9MRU5HVEggP1xuICAgICAgICAgICAgICAgIFwidHdlZXQgdHdlZXRMZW5ndGggdHdlZXRSZWRcIiA6IFwidHdlZXQgdHdlZXRMZW5ndGhcIn0sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgXCJZb3VyIHR3ZWV0IGlzIFwiLCAgdm0ubmV3VHdlZXRCb2R5KCkgPyB2bS5uZXdUd2VldEJvZHkoKS5sZW5ndGggOiAwLCBcIiBjaGFyYWN0ZXJzIGxvbmdcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBdfSwgXG4gICAgICAgICAgICB7dGFnOiBcImJ1dHRvblwiLCBhdHRyczoge2NsYXNzOlwiYnRuIGJ0bi1zdWNjZXNzIHR3ZWV0QnRuXCIsIG9uY2xpY2s6IGZ1bmN0aW9uKCkgeyB2bS5hZGRUd2VldCh2bSkgfX0sIGNoaWxkcmVuOiBbXCJUd2VldFwiXX1cbiAgICAgICAgXX1cbiAgICBdfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdHJldHVybiB7dGFnOiBcImRpdlwiLCBhdHRyczoge30sIGNoaWxkcmVuOiBbXG5cbnt0YWc6IFwibmF2XCIsIGF0dHJzOiB7Y2xhc3M6XCJuYXZiYXIgbmF2YmFyLWRlZmF1bHQgbmF2YmFyLXN0YXRpYy10b3BcIn0sIGNoaWxkcmVuOiBbXG4gICAgIG5hdmJhciwgXG4gICAgIHZtLmxvZ2dlZEluID8gbmV3VHdlZXQgOiB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwibm9Ud2VldFwifSwgY2hpbGRyZW46IFtcImxvZ2luIHRvIG1ha2UgYSB0d2VldCFcIl19LCBcbiAgICB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwiYWxlcnQgYWxlcnQtZGFuZ2VyXCIsIHN0eWxlOiB2bS5lcnJvcigpLmxlbmd0aCA/ICdkaXNwbGF5OiBibG9jaycgOiAnZGlzcGxheTogbm9uZSd9LCBjaGlsZHJlbjogW1xuICAgICAgICAgdm0uZXJyb3IoKSBcbiAgICBdfVxuXX0sIFxuXG5cblx0dm0udHdlZXRzLm1hcChmdW5jdGlvbih0d2VldCwgaW5kZXgpIHsgICAgICAgXG5cdFx0cmV0dXJuIHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7Y2xhc3M6XCJmZWVkXCJ9LCBjaGlsZHJlbjogW1xuXHRcdFx0e3RhZzogXCJzcGFuXCIsIGF0dHJzOiB7Y2xhc3M6XCJhdXRob3JcIn0sIGNoaWxkcmVuOiBbIHR3ZWV0LmF1dGhvcigpIF19LCBcbiAgICAgICAgICAgIHt0YWc6IFwic3BhblwiLCBhdHRyczoge2NsYXNzOlwidGltZXN0YW1wXCJ9LCBjaGlsZHJlbjogWyBtb21lbnQodHdlZXQudGltZXN0YW1wKCkpLmZyb21Ob3coKSBdfSwgXG5cdFx0XHR7dGFnOiBcImRpdlwiLCBhdHRyczoge30sIGNoaWxkcmVuOiBbIHR3ZWV0LmJvZHkoKSBdfVxuXHRcdF19XG5cdH0pXG5cblxuXHRdfTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbn1cblxuXG5mdW5jdGlvbiBtVmlldyh2bSkge1xuICAgIHJldHVybiBtKFwiaHRtbFwiLCBbXG4gICAgXHRtKFwiaGVhZFwiLCBbXG4gICAgXHRcdG0oXCJsaW5rW2hyZWY9J3N0eWxlLmNzcyddW3JlbD1zdHlsZXNoZWV0XVwiKVxuICBcdFx0XSksXG4gICAgICAgIG0oXCJib2R5XCIsIFsgXG5cbiAgICAgICAgXHRtKFwiaW5wdXRcIiwge1xuICAgICAgICBcdFx0cGxhY2Vob2xkZXI6ICdlbnRlciB5b3VyIG5hbWUnLFxuICAgICAgICBcdFx0b25pbnB1dDogbS53aXRoQXR0cihcInZhbHVlXCIsIHZtLm5ld1R3ZWV0QXV0aG9yKSxcbiAgICAgICAgXHR9LCB2bS5uZXdUd2VldEF1dGhvcigpKSxcblxuICAgICAgICBcdG0oXCJkaXZcIiwge1xuICAgICAgICBcdFx0Y2xhc3M6ICd0d2VldGJveCcsICBcbiAgICAgICAgXHRcdGNvbnRlbnRlZGl0YWJsZTondHJ1ZScsXG4gICAgICAgIFx0XHRvbmlucHV0OiBtLndpdGhBdHRyKFwiaW5uZXJUZXh0XCIsIHZtLm5ld1R3ZWV0Qm9keSksICAgICAgICBcdFx0XG4gICAgICAgIFx0fSwgdm0ubmV3VHdlZXRCb2R5KCkpLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBtKFwiZGl2XCIsIHsgc3R5bGU6IHtcbiAgICAgICAgICAgIFx0Zm9udFN0eWxlOiAnaXRhbGljJyxcbiAgICAgICAgICAgIFx0Zm9udFNpemU6ICcwLjhlbScsXG4gICAgICAgICAgICBcdGNvbG9yOiAodm0ubmV3VHdlZXRCb2R5KCkgPyB2bS5uZXdUd2VldEJvZHkoKS5sZW5ndGggOiAwKSA+IHZtLk1BWF9UV0VFVF9MRU5HVEggPyBcInJlZFwiIDogXCJibGFja1wiXG4gICAgICAgICAgICB9IH0sIFwiWW91ciB0d2VldCBpcyBcIiArICh2bS5uZXdUd2VldEJvZHkoKSA/IHZtLm5ld1R3ZWV0Qm9keSgpLmxlbmd0aCA6IDApICsgXCIgY2hhcmFjdGVycyBsb25nXCIpLFxuICAgICAgICAgICAgbShcImJ1dHRvblwiLCB7IG9uY2xpY2s6IGZ1bmN0aW9uKCkgeyB2bS5hZGRUd2VldCh2bSkgfSB9LCBcIlR3ZWV0XCIpLFxuXG4gICAgICAgICAgICBtKFwidGFibGVcIiwgW1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBdKVxuXG4gICAgICAgIF0pIC8vIGVuZCBodG1sLmJvZHlcbiAgICBdKVxufSAvLyBlbmQgdmlld1xuXG4iXX0=
