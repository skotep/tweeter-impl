import React, { PropTypes } from 'react'
import moment from 'moment'

const Tweet = ({author, timestamp, body}) => (
    <div className="feed">
        <span className="author">{ author }</span>
        <span className="timestamp">{ moment(timestamp).fromNow() }</span>
        <div>{ body }</div>
    </div>
)

Tweet.propTypes = {
    author: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired
}

export default Tweet
