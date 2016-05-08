import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import Tweet from './tweet.jsx'

const Tweets = ({tweets}) => (
    <div>
        {tweets.map(tweet =>
            <Tweet key={tweet._id} 
                author={tweet.author} 
                timestamp={tweet.timestamp} 
                body={tweet.body} 
            />
        )}
    </div>
)

Tweets.propTypes = {
    tweets: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        ...Tweet.propTypes
    }).isRequired).isRequired
}

const mapStateToProps = (state) => {
    return { tweets: state.tweets }
}

const mapDispatchToProps = (dispatch) => {
    return { }
}

const TweetList = connect(
    mapStateToProps,
    mapDispatchToProps
)(Tweets)

export default TweetList
