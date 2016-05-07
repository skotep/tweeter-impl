import React, {Component} from 'react'
import { createStore } from 'redux'
import Tweet from './tweet.jsx'
import $ from 'jquery'

var MAX_TWEET_LENGTH = 140

var SERVER_POLLING_INTERVAL = 60000;

export default class TweetCtrl extends Component {

    constructor(props) {
        super(props)
        this.state = {
            username: '',
            newUsername: '',
            newTweetBody: '',
            error: '',
            tweets: [ ]
        }
    }

    isLoggedIn() {
        return this.state.username
    }

	login(e) {
        this.setState({
            newUsername: 'Welcome ' + this.state.newUsername + '!',
            username: this.state.newUsername,
            error: this.state.newUsername.length > 0 ? '' : 'please enter a username',
            newTweetBody: ''
        })
	}

	logout(e) {
        this.setState({
            newUsername: '',
            username: '',
            error: '',
            newTweetBody: ''
        })
	}

    handleUsername(e) {
        this.setState({ newUsername: e.target.value })
    }

    handleNewTweetBody(e) {
        this.setState({ newTweetBody: e.target.value })
    }

    render() {
        const navbar = (
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    <img className="owl-icon" src="./Rice_Owl_small.jpg"></img>
                </a>
                <a className="navbar-brand blue-text" href="#">
                    Tweeter
                </a>
                <div className="navbar-default pull-right">
                    <input placeholder="username" 
                        className={ this.isLoggedIn() ? 'navbar-default login-field welcome' : 'navbar-default login-field'}
                        value={ this.state.newUsername }
                        readOnly={ this.isLoggedIn() }
                        onChange={this.handleUsername.bind(this)} />
                    <button className="btn btn-primary"
                        onClick={ this.isLoggedIn() ? this.logout.bind(this) : this.login.bind(this) } >
                        { this.isLoggedIn() ? 'logout' : ' login' } 
                    </button>            
                </div>
            </div>
        );

        const newTweet = (
            <div className="tweet">
                <ContentEditable onChange={this.handleNewTweetBody.bind(this)} html=""/>
                <div>
                    <span className={ this.state.newTweetBody.length > MAX_TWEET_LENGTH ?
                                      'tweet tweetLength tweetRed' : 'tweet tweetLength' }>
                        Your tweet is {this.state.newTweetBody.length} characters long                    
                    </span>
                    <button className="btn btn-success tweetBtn" onClick={this.addTweet.bind(this)}>Tweet</button>            
                </div>
            </div>
        );

        return (
            <div>
                <nav className="navbar navbar-default navbar-static-top">
                    { navbar }
                    { this.isLoggedIn() ? newTweet : <div className="noTweet">login to make a tweet!</div> }
                    <div className="alert alert-danger" style={{ display: this.state.error.length ? 'block' : 'none' }}>
                        { this.state.error }
                    </div>
                </nav>

                {this.state.tweets.map(tweet =>
                    <Tweet key={tweet._id} author={tweet.author} timestamp={tweet.timestamp} body={tweet.body} />
                )}
            </div>
        );
    }

    addTweet(e) {
        const vm = this
		const body = this.state.newTweetBody
		const author = this.state.username
		if (!body || !author) {
            return
        }
        if (body.length > MAX_TWEET_LENGTH) {
            return window.alert('Content must be less than ' + MAX_TWEET_LENGTH + ' characters')
        }
        $.ajax({
            type: 'PUT', url: '/tweet', headers: {'Content-Type': 'application/json'},
            data: JSON.stringify({ body: body, author: author }),
            success: function(response) {
                const tweets = vm.state.tweets;
                tweets.unshift(response)
                vm.setState({error: '', newTweetBody: '', tweets: tweets})
            },
            error: function(err) {
                vm.setState({error: err})
                console.log('there was an error', err)
            }
        })
    };

    getTweets() {
        const vm = this
		console.log('poll server...')
        $.get('/tweet', function(result) {
            result.tweets.sort((b,a) => { 
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() 
            })
            vm.setState({ tweets: result.tweets, error: '' })
        })
    }

    componentDidMount() {
        this.poll()
    }

    poll() {
        console.log('poll server...', this.state.tweets)
        this.getTweets()
		//TODO setTimeout(this.poll, SERVER_POLLING_INTERVAL)
    }
}

const ContentEditable = React.createClass({
    render() {
        return <div className="tweetbox"
            onInput={this.emitChange} 
            onBlur={this.emitChange}
            contentEditable
            dangerouslySetInnerHTML={{__html: this.props.html}}></div>;
                                                
    },

    emitChange(e) {
        const html = e.target.innerHTML
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange({
                target: {
                    value: html
                }
            });
        }
        this.lastHtml = html;
    }
});

