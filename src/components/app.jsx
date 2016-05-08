import React, { Component } from 'react'
import Header from './header.jsx'
import TweetList from './tweetList.jsx'

class App extends Component {
    render() { return (
        <div>
            <Header />
            <TweetList />
        </div>
    )}
}

export default App
