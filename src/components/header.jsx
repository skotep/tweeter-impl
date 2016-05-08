import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import NewTweet from './newTweet.jsx'
import Login from './loginView.jsx'
import ErrorMessage from './errorMessage.jsx'

const Header = ({username}) => (
    <nav className="navbar navbar-default navbar-static-top">
        <Login />
        { username ? <NewTweet /> : <div className="noTweet">login to make a tweet!</div> }
        <ErrorMessage />
    </nav>  
)

const mapStateToProps = (state) => {
    return { 
        username: state.username        
    }
}
export default connect(mapStateToProps)(Header)
