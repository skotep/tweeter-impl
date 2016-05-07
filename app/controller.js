
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
		, username: m.prop('')

		, newTweetBody: m.prop('')
		, error: m.prop('')

		, login: login
		, logout: logout

		, addTweet: addTweet
		, getTweets: getTweets
		, MAX_TWEET_LENGTH: MAX_TWEET_LENGTH
	}

	function login() {
		vm.loggedIn = vm.username().length > 0;
		vm.error(vm.loggedIn ? '' : 'please enter a username')
		vm.newTweetBody('')
	}

	function logout() {
		vm.loggedIn = false;
		vm.username('')
		vm.error('')
		vm.newTweetBody('')
	}

	function getTweets(vm) {
		vm.error('')
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
		vm.error('')
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
						vm.newTweetBody('')
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
