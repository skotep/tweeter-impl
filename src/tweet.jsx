import React, {Component} from 'react'
import moment from 'moment'

export default class Tweet extends Component {
    render() {
		return (
            <div className="feed">
                <span className="author">{ this.props.author }</span>            
                <span className="timestamp">{ moment(this.props.timestamp).fromNow() }</span>
                <div>{ this.props.body }</div>
            </div>
        )
    }
}

