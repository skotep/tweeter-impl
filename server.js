var express = require('express')
var bodyParser = require('body-parser')
var logger  = require('morgan')

var Tweet = require('./app_server/db.js').Tweet

var app = express()

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.disable('x-powered-by')

app.put('/tweet', bodyParser.json(), putTweet)
app.get('/tweet', getTweet)

var tweets = []

function initTweets() {
	require('./RiceUniversity-tweets.json').forEach(function(twt) {
		new Tweet(twt).save(function(err, t) {
			console.log(err, t)
		})		
		//tweets.unshift(twt)
	})

}
// initTweets()

function putTweet(req, res) {
	var payload = req.body
	if (payload.author && payload.author.length > 0 &&
		payload.body && payload.body.length > 0) {
		new Tweet({ 
			body: payload.body, 
			author: payload.author, 
			timestamp: new Date().getTime() 
		}).save(function(err, tweet) {
			if (err) {
				console.log('error', err)
				res.status(500).send({ error: err })
			} else {
				res.send(tweet)
			}
		})		
	} else {
		res.status(400).send({ error: 'Tweet must have both author and body' })
	}
}

function getTweet(req, res) {
	Tweet.find().sort({ timestamp: -1 }).limit(10).exec(function(err, items) {
		if (err) {
			console.log('error', err)
			res.status(500).send({ error: err })
		} else {
			items.reverse()
			res.send({ 'tweets': items })
		}
	})	
}

exports.start = function() {
	var port = process.env.PORT || 3000
    var server = app.listen(port, function() {
            console.log('Server listening at http://%s:%s',
                    server.address().address, server.address().port)
	})
}


