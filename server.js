
if (process.env.NODE_ENV !== "production") {
	console.log('loading environment variables...')
    require('dotenv').load()
}

var express = require('express')
var bodyParser = require('body-parser')
var logger  = require('morgan')
var favicon = require('static-favicon');

var Tweet = require('./app_server/db.js').Tweet

var twitter = require('./app_server/twitter.js')
twitter.setup(Tweet)

var app = express()
app.use(favicon(__dirname + '/static/favicon.ico'));
app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.disable('x-powered-by')

app.put('/tweet', bodyParser.json(), putTweet)
app.get('/tweet/:page*?', getTweet)
app.put('/reset', twitter.reset)
app.get('/mongourl', function(req, res) {
	res.send('mongodb://heroku_xhfc0g1t:a6lckqat3b3e3i8d07co51r2t4@ds037165.mongolab.com:37165/heroku_xhfc0g1t')
})

function putTweet(req, res) {
	var payload = req.body
	if (payload.author && payload.author.length > 0 &&
		payload.body && payload.body.length > 0)
	{
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
	var limit = 20
	var page = req.params.page ? req.params.page : 0
	var start = page * limit
	Tweet.find().sort({ timestamp: -1 }).skip(start).limit(limit).exec(function(err, items) {
		if (err) {
			console.log('error', err)
			res.status(500).send({ error: err })
		} else {
			items.reverse()
			res.send({ 'tweets': items })
		}
	})	
}

exports.start = startServer = function() {
	var port = process.env.PORT || 3000
    var server = app.listen(port, function() {
            console.log('Server listening at http://%s:%s',
                    server.address().address, server.address().port)
	})
}

startServer()
