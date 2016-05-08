import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { addTweet } from '../actions.jsx'

const MAX_TWEET_LENGTH = 140

class ContentEditable extends Component {

    constructor(props) {
        super(props)
        this.emitChange = this.emitChange.bind(this)
    }

    render() {        
        return <div className="tweetbox"
            onInput={this.emitChange} 
            onBlur={this.emitChange}
            contentEditable
            dangerouslySetInnerHTML={{__html: this.props.html}}
        ></div>;
    }

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
}

ContentEditable.propTypes = {
    onChange: PropTypes.func.isRequired,
    html: PropTypes.string.isRequired
}

class NewTweet extends Component {
    
    constructor(props) {
        super(props)
        this.newTweetBody = ''    
    }

    render() { return (
        <div className="tweet">
            <ContentEditable
                onChange={(e) => { 
                    this.newTweetBody = e.target.value
                    this.forceUpdate()
                }}
                html={ this.newTweetBody }
            />
            <div>
                <span className={ this.newTweetBody.length > MAX_TWEET_LENGTH ?
                                  'tweet tweetLength tweetRed' : 'tweet tweetLength' }>
                    Your tweet is {this.newTweetBody.length} characters long
                </span>
                <button className="btn btn-success tweetBtn" 
                    onClick={() => { 
                        if (this.newTweetBody.length > MAX_TWEET_LENGTH) {
                            window.alert('Content must be less than ' + MAX_TWEET_LENGTH + ' characters')
                        } else {
                            this.props.dispatch(addTweet(this.newTweetBody))
                            this.newTweetBody = ''
                            this.forceUpdate()                            
                        }
                    }}>
                    Tweet</button>
            </div>
        </div>
    )}
}

NewTweet.propTypes = {
    dispatch: PropTypes.func.isRequired
}

export default connect()(NewTweet)
