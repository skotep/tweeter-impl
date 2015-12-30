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

var dummy = 'https://webdev-dummy.herokuapp.com'

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvYXBwLmpzIiwiYXBwL2NvbnRyb2xsZXIuanMiLCJhcHAvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCI7KGZ1bmN0aW9uKCkge1xuXG52YXIgdmlldyA9IHJlcXVpcmUoJy4vdmlldy5qcycpLmdldFxudmFyIGN0cmwgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXIuanMnKS5nZXRcblxuLy9pbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyksIHsgY29udHJvbGxlcjogY3RybCwgdmlldzogdmlldyB9KVxuXG59KSgpOyIsIlxuZXhwb3J0cy5nZXQgPSBnZXRDb250cm9sbGVyXHRcblxudmFyIE1BWF9UV0VFVF9MRU5HVEggPSAxNDBcblxudmFyIFNFUlZFUl9QT0xMSU5HX0lOVEVSVkFMID0gNjAwMDA7XG5cbnZhciBkdW1teSA9ICdodHRwczovL3dlYmRldi1kdW1teS5oZXJva3VhcHAuY29tJ1xuXG4vLyBtb2RlbCByZXByZXNlbnRhdGlvbiBvZiBhIFR3ZWV0XG5mdW5jdGlvbiBUd2VldChkYXRhKSB7XG5cdHRoaXMuYm9keSA9IG0ucHJvcChkYXRhLmJvZHkpXG5cdHRoaXMuYXV0aG9yID0gbS5wcm9wKGRhdGEuYXV0aG9yKVxuXHR0aGlzLnRpbWVzdGFtcCA9IG0ucHJvcChkYXRhLnRpbWVzdGFtcClcbn1cblxuZnVuY3Rpb24gZ2V0Q29udHJvbGxlcigpIHtcdFxuXG5cdHZhciB2bSA9IHsgXG5cdFx0ICB0d2VldHM6IFtdXG5cblx0XHQsIGxvZ2dlZEluOiBmYWxzZVxuXHRcdCwgdXNlcm5hbWU6IG0ucHJvcChcIlwiKVxuXG5cdFx0LCBuZXdUd2VldEJvZHk6IG0ucHJvcChcIlwiKVx0XHRcblx0XHQsIGVycm9yOiBtLnByb3AoXCJcIilcblxuXHRcdCwgbG9naW46IGxvZ2luXG5cdFx0LCBsb2dvdXQ6IGxvZ291dFxuXG5cdFx0LCBhZGRUd2VldDogYWRkVHdlZXRcblx0XHQsIGdldFR3ZWV0czogZ2V0VHdlZXRzXG5cdFx0LCBNQVhfVFdFRVRfTEVOR1RIOiBNQVhfVFdFRVRfTEVOR1RIXG5cdH1cblxuXHRmdW5jdGlvbiBsb2dpbigpIHtcblx0XHR2bS5sb2dnZWRJbiA9IHZtLnVzZXJuYW1lKCkubGVuZ3RoID4gMDtcblx0XHR2bS5lcnJvcih2bS5sb2dnZWRJbiA/IFwiXCIgOiBcInBsZWFzZSBlbnRlciBhIHVzZXJuYW1lXCIpXG5cdFx0dm0ubmV3VHdlZXRCb2R5KFwiXCIpXG5cdH1cblxuXHRmdW5jdGlvbiBsb2dvdXQoKSB7XG5cdFx0dm0ubG9nZ2VkSW4gPSBmYWxzZTtcblx0XHR2bS51c2VybmFtZShcIlwiKVxuXHRcdHZtLmVycm9yKFwiXCIpXG5cdFx0dm0ubmV3VHdlZXRCb2R5KFwiXCIpXG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUd2VldHModm0pIHtcblx0XHR2bS5lcnJvcihcIlwiKVxuXHRcdGNvbnNvbGUubG9nKCdwb2xsIHNlcnZlci4uLicpXG5cblx0XHR2YXIgcmVzcG9uc2UgPSBtLnByb3Aoe30pXG5cdFx0bS5yZXF1ZXN0KHsgbWV0aG9kOiAnR0VUJywgdXJsOiAnL3R3ZWV0J30pLnRoZW4ocmVzcG9uc2UpLnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgciA9IHJlc3BvbnNlKClcdFx0XHRcdFx0XHRcblx0XHRcdGlmIChyICYmIHIudHdlZXRzKSB7XG5cdFx0XHRcdHZtLnR3ZWV0cy5sZW5ndGggPSAwXG5cdFx0XHRcdHIudHdlZXRzLmZvckVhY2goZnVuY3Rpb24odHd0KSB7XHRcdFx0XHRcdFxuXHRcdFx0XHRcdHZtLnR3ZWV0cy51bnNoaWZ0KG5ldyBUd2VldCh7IFxuXHRcdFx0XHRcdFx0YXV0aG9yOiB0d3QuYXV0aG9yLFxuXHRcdFx0XHRcdFx0Ym9keTogdHd0LmJvZHksIFxuXHRcdFx0XHRcdFx0dGltZXN0YW1wOiB0d3QudGltZXN0YW1wXG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRcdH0pXG5cdFx0XHR9XHRcdFx0XG5cdFx0fSlcblx0fVxuXG5cdGZ1bmN0aW9uIGFkZFR3ZWV0KHZtKSB7XG5cdFx0dm0uZXJyb3IoXCJcIilcblx0XHR2YXIgYm9keSA9IHZtLm5ld1R3ZWV0Qm9keSgpXHRcdFxuXHRcdHZhciBhdXRob3IgPSB2bS51c2VybmFtZSgpXHRcdFxuXHRcdGlmIChib2R5KSB7XG5cdFx0XHRpZiAoYm9keS5sZW5ndGggPiBNQVhfVFdFRVRfTEVOR1RIKSB7XG5cdFx0XHRcdHdpbmRvdy5hbGVydCgnQ29udGVudCBtdXN0IGJlIGxlc3MgdGhhbiAnICsgTUFYX1RXRUVUX0xFTkdUSCArICcgY2hhcmFjdGVycycpXG5cdFx0XHR9IGVsc2Uge1x0XHRcdFx0XG5cdFx0XHRcdHZhciBuZXdUd2VldCA9IG5ldyBUd2VldCh7IGJvZHk6IGJvZHksIGF1dGhvcjogYXV0aG9yIH0pXG5cdFx0XHRcdHZhciByZXNwb25zZSA9IG0ucHJvcCh7fSlcblx0XHRcdFx0dmFyIGVycm9yID0gbS5wcm9wKHt9KVxuXHRcdFx0XHRtLnJlcXVlc3QoeyBtZXRob2Q6ICdQVVQnLCB1cmw6ICcvdHdlZXQnLCBkYXRhOiBuZXdUd2VldCB9KS50aGVuKHJlc3BvbnNlLCBlcnJvcikudGhlbihmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgZSA9IGVycm9yKClcblx0XHRcdFx0XHR2YXIgciA9IHJlc3BvbnNlKClcdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKCFlIHx8ICFlLmVycm9yKSB7XG5cdFx0XHRcdFx0XHRuZXdUd2VldC50aW1lc3RhbXAoci50aW1lc3RhbXApXG5cdFx0XHRcdFx0XHR2bS50d2VldHMudW5zaGlmdChuZXdUd2VldClcdFx0XG5cdFx0XHRcdFx0XHR2bS5uZXdUd2VldEJvZHkoXCJcIilcblx0XHRcdFx0XHR9IGVsc2Uge1x0XG5cdFx0XHRcdFx0XHR2bS5lcnJvcihlLmVycm9yID8gZS5lcnJvciA6IGUpXG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygndGhlcmUgd2FzIGFuIGVycm9yJywgZS5lcnJvcilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHR9XHRcdFxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHBvbGwoKSB7XHRcblx0XHRnZXRUd2VldHModm0pXG5cdFx0c2V0VGltZW91dChwb2xsLCBTRVJWRVJfUE9MTElOR19JTlRFUlZBTClcblx0fVx0XG5cdHBvbGwoKVxuXHRcblx0cmV0dXJuIHZtXG59IiwiLyoqIEBqc3ggbSAqL1xuXG5leHBvcnRzLmdldCA9IHhWaWV3XG5cbmZ1bmN0aW9uIHhWaWV3KHZtKSB7XG4gICAgXG4gICAgdmFyIG5hdmJhciA9IHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7Y2xhc3M6XCJjb250YWluZXItZmx1aWRcIn0sIGNoaWxkcmVuOiBbXG4gICAgICAgIHt0YWc6IFwiYVwiLCBhdHRyczoge2NsYXNzOlwibmF2YmFyLWJyYW5kXCIsIGhyZWY6XCIjXCJ9LCBjaGlsZHJlbjogW1xuICAgICAgICAgICAge3RhZzogXCJpbWdcIiwgYXR0cnM6IHtjbGFzczpcIm93bC1pY29uXCIsIHNyYzpcIi4vUmljZV9Pd2xfc21hbGwuanBnXCJ9fVxuICAgICAgICBdfSwgXG4gICAgICAgIHt0YWc6IFwiYVwiLCBhdHRyczoge2NsYXNzOlwibmF2YmFyLWJyYW5kIGJsdWUtdGV4dFwiLCBocmVmOlwiI1wifSwgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIFwiVHdlZXRlclwiXG4gICAgICAgIF19LCBcbiAgICAgICAge3RhZzogXCJkaXZcIiwgYXR0cnM6IHtjbGFzczpcIm5hdmJhci1kZWZhdWx0IHB1bGwtcmlnaHRcIn0sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2bS5sb2dnZWRJbiA/IFxuICAgICAgICAgICAgICAgIHt0YWc6IFwiaW5wdXRcIiwgYXR0cnM6IHt2YWx1ZTogJ1dlbGNvbWUgJyArIHZtLnVzZXJuYW1lKCkgKyAnIScsIFxuICAgICAgICAgICAgICAgICAgICBjbGFzczpcIm5hdmJhci1kZWZhdWx0IGxvZ2luLWZpZWxkIHdlbGNvbWVcIiwgXG4gICAgICAgICAgICAgICAgICAgIHJlYWRvbmx5OnRydWV9fSA6IFxuICAgICAgICAgICAgICAgIHt0YWc6IFwiaW5wdXRcIiwgYXR0cnM6IHtwbGFjZWhvbGRlcjpcInVzZXJuYW1lXCIsIFxuICAgICAgICAgICAgICAgICAgICBjbGFzczpcIm5hdmJhci1kZWZhdWx0IGxvZ2luLWZpZWxkXCIsIFxuICAgICAgICAgICAgICAgICAgICBvbmlucHV0OiBtLndpdGhBdHRyKFwidmFsdWVcIiwgdm0udXNlcm5hbWUpIH19LCBcbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICB7dGFnOiBcImJ1dHRvblwiLCBhdHRyczoge2NsYXNzOlwiYnRuIGJ0bi1wcmltYXJ5XCIsIFxuICAgICAgICAgICAgICAgIG9uY2xpY2s6IHZtLmxvZ2dlZEluID8gdm0ubG9nb3V0IDogdm0ubG9naW59LCBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgICB2bS5sb2dnZWRJbiA/ICdsb2dvdXQnIDogJyBsb2dpbidcbiAgICAgICAgICAgIF19XG5cblxuICAgICAgICBdfVxuICAgIF19XG5cbiAgICB2YXIgbmV3VHdlZXQgPSB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwidHdlZXRcIn0sIGNoaWxkcmVuOiBbXG4gICAgICAgIHt0YWc6IFwiZGl2XCIsIGF0dHJzOiB7Y2xhc3M6XCJ0d2VldGJveFwiLCBjb250ZW50ZWRpdGFibGU6XCJ0cnVlXCIsIFxuICAgICAgICAgICAgb25pbnB1dDogbS53aXRoQXR0cihcImlubmVyVGV4dFwiLCB2bS5uZXdUd2VldEJvZHkpIH0sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgdm0ubmV3VHdlZXRCb2R5KCkgXG4gICAgICAgIF19LCBcbiAgICAgICAgICAgIFxuICAgICAgICB7dGFnOiBcImRpdlwiLCBhdHRyczoge30sIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICB7dGFnOiBcInNwYW5cIiwgYXR0cnM6IHtjbGFzczogKHZtLm5ld1R3ZWV0Qm9keSgpID8gdm0ubmV3VHdlZXRCb2R5KCkubGVuZ3RoIDogMCkgPiB2bS5NQVhfVFdFRVRfTEVOR1RIID9cbiAgICAgICAgICAgICAgICBcInR3ZWV0IHR3ZWV0TGVuZ3RoIHR3ZWV0UmVkXCIgOiBcInR3ZWV0IHR3ZWV0TGVuZ3RoXCJ9LCBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgIFwiWW91ciB0d2VldCBpcyBcIiwgIHZtLm5ld1R3ZWV0Qm9keSgpID8gdm0ubmV3VHdlZXRCb2R5KCkubGVuZ3RoIDogMCwgXCIgY2hhcmFjdGVycyBsb25nXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXX0sIFxuICAgICAgICAgICAge3RhZzogXCJidXR0b25cIiwgYXR0cnM6IHtjbGFzczpcImJ0biBidG4tc3VjY2VzcyB0d2VldEJ0blwiLCBvbmNsaWNrOiBmdW5jdGlvbigpIHsgdm0uYWRkVHdlZXQodm0pIH19LCBjaGlsZHJlbjogW1wiVHdlZXRcIl19XG4gICAgICAgIF19XG4gICAgXX1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRyZXR1cm4ge3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9LCBjaGlsZHJlbjogW1xuXG57dGFnOiBcIm5hdlwiLCBhdHRyczoge2NsYXNzOlwibmF2YmFyIG5hdmJhci1kZWZhdWx0IG5hdmJhci1zdGF0aWMtdG9wXCJ9LCBjaGlsZHJlbjogW1xuICAgICBuYXZiYXIsIFxuICAgICB2bS5sb2dnZWRJbiA/IG5ld1R3ZWV0IDoge3RhZzogXCJkaXZcIiwgYXR0cnM6IHtjbGFzczpcIm5vVHdlZXRcIn0sIGNoaWxkcmVuOiBbXCJsb2dpbiB0byBtYWtlIGEgdHdlZXQhXCJdfSwgXG4gICAge3RhZzogXCJkaXZcIiwgYXR0cnM6IHtjbGFzczpcImFsZXJ0IGFsZXJ0LWRhbmdlclwiLCBzdHlsZTogdm0uZXJyb3IoKS5sZW5ndGggPyAnZGlzcGxheTogYmxvY2snIDogJ2Rpc3BsYXk6IG5vbmUnfSwgY2hpbGRyZW46IFtcbiAgICAgICAgIHZtLmVycm9yKCkgXG4gICAgXX1cbl19LCBcblxuXG5cdHZtLnR3ZWV0cy5tYXAoZnVuY3Rpb24odHdlZXQsIGluZGV4KSB7ICAgICAgIFxuXHRcdHJldHVybiB7dGFnOiBcImRpdlwiLCBhdHRyczoge2NsYXNzOlwiZmVlZFwifSwgY2hpbGRyZW46IFtcblx0XHRcdHt0YWc6IFwic3BhblwiLCBhdHRyczoge2NsYXNzOlwiYXV0aG9yXCJ9LCBjaGlsZHJlbjogWyB0d2VldC5hdXRob3IoKSBdfSwgXG4gICAgICAgICAgICB7dGFnOiBcInNwYW5cIiwgYXR0cnM6IHtjbGFzczpcInRpbWVzdGFtcFwifSwgY2hpbGRyZW46IFsgbW9tZW50KHR3ZWV0LnRpbWVzdGFtcCgpKS5mcm9tTm93KCkgXX0sIFxuXHRcdFx0e3RhZzogXCJkaXZcIiwgYXR0cnM6IHt9LCBjaGlsZHJlbjogWyB0d2VldC5ib2R5KCkgXX1cblx0XHRdfVxuXHR9KVxuXG5cblx0XX07XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG59XG5cblxuZnVuY3Rpb24gbVZpZXcodm0pIHtcbiAgICByZXR1cm4gbShcImh0bWxcIiwgW1xuICAgIFx0bShcImhlYWRcIiwgW1xuICAgIFx0XHRtKFwibGlua1tocmVmPSdzdHlsZS5jc3MnXVtyZWw9c3R5bGVzaGVldF1cIilcbiAgXHRcdF0pLFxuICAgICAgICBtKFwiYm9keVwiLCBbIFxuXG4gICAgICAgIFx0bShcImlucHV0XCIsIHtcbiAgICAgICAgXHRcdHBsYWNlaG9sZGVyOiAnZW50ZXIgeW91ciBuYW1lJyxcbiAgICAgICAgXHRcdG9uaW5wdXQ6IG0ud2l0aEF0dHIoXCJ2YWx1ZVwiLCB2bS5uZXdUd2VldEF1dGhvciksXG4gICAgICAgIFx0fSwgdm0ubmV3VHdlZXRBdXRob3IoKSksXG5cbiAgICAgICAgXHRtKFwiZGl2XCIsIHtcbiAgICAgICAgXHRcdGNsYXNzOiAndHdlZXRib3gnLCAgXG4gICAgICAgIFx0XHRjb250ZW50ZWRpdGFibGU6J3RydWUnLFxuICAgICAgICBcdFx0b25pbnB1dDogbS53aXRoQXR0cihcImlubmVyVGV4dFwiLCB2bS5uZXdUd2VldEJvZHkpLCAgICAgICAgXHRcdFxuICAgICAgICBcdH0sIHZtLm5ld1R3ZWV0Qm9keSgpKSxcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbShcImRpdlwiLCB7IHN0eWxlOiB7XG4gICAgICAgICAgICBcdGZvbnRTdHlsZTogJ2l0YWxpYycsXG4gICAgICAgICAgICBcdGZvbnRTaXplOiAnMC44ZW0nLFxuICAgICAgICAgICAgXHRjb2xvcjogKHZtLm5ld1R3ZWV0Qm9keSgpID8gdm0ubmV3VHdlZXRCb2R5KCkubGVuZ3RoIDogMCkgPiB2bS5NQVhfVFdFRVRfTEVOR1RIID8gXCJyZWRcIiA6IFwiYmxhY2tcIlxuICAgICAgICAgICAgfSB9LCBcIllvdXIgdHdlZXQgaXMgXCIgKyAodm0ubmV3VHdlZXRCb2R5KCkgPyB2bS5uZXdUd2VldEJvZHkoKS5sZW5ndGggOiAwKSArIFwiIGNoYXJhY3RlcnMgbG9uZ1wiKSxcbiAgICAgICAgICAgIG0oXCJidXR0b25cIiwgeyBvbmNsaWNrOiBmdW5jdGlvbigpIHsgdm0uYWRkVHdlZXQodm0pIH0gfSwgXCJUd2VldFwiKSxcblxuICAgICAgICAgICAgbShcInRhYmxlXCIsIFtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgXSlcblxuICAgICAgICBdKSAvLyBlbmQgaHRtbC5ib2R5XG4gICAgXSlcbn0gLy8gZW5kIHZpZXdcblxuIl19
