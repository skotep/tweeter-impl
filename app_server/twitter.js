// twitter.js
var Twitter = require('twit')

var T = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET	
})

var Tweet;
exports.setup = function(T) {
	Tweet = T
	Tweet.find({ author: 'RiceUniversity' }).exec(function(err, items) {
		console.log('Rice has ' + items.length)
		if (items.length < 25) {			
			reset()			
		}		
		beginStream(Tweet)
	})
}

exports.reset = reset

function reset(req, res) {
	console.log('Remove all tweets...')
	Tweet.remove().exec(function() {
		initWithTimeline()
	})
	res.sendStatus(200)
}

function twitterToTweet(tweet) {
	return { 
		timestamp: new Date(tweet.created_at).getTime(),
		author: tweet.user.screen_name, 
		body: tweet.text        		
	}
}

function saveTweet(tweet) {
	new Tweet(twitterToTweet(tweet)).save(function(err, t) {
		if (err) 
			console.log(err, tweet)
		else
			console.log('saved', t)
	})   
}

function initWithTimeline() {
	console.log('Twitter query to initialize with Timeline')

    var params = {         
        count: 100,
		user_id:'RiceUniversity',
        screen_name:'RiceUniversity' 
    }

    T.get('statuses/user_timeline', params, function(err, data, resp) {
        if(err) throw err;
        data.forEach(function(tweet) {        
        	saveTweet(tweet)
        })    
    }); 

}

function beginStream() {
	console.log('connecting stream to RiceUniversity')
	var stream = T.stream('statuses/filter', { track: 'RiceUniversity'})
	stream.on('tweet', function(tweet) {
		saveTweet(tweet)
	})
}

