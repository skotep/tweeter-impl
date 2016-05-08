import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { onLoginClick } from './actions.jsx'
import NewTweet from './newTweet.jsx'

const LoginView = ({username, onLoginClick}) => {
    let newUsername

    return (
        <div className="container-fluid">
            <a className="navbar-brand" href="#">
                <img className="owl-icon" src="./Rice_Owl_small.jpg"></img>
            </a>
            <a className="navbar-brand blue-text" href="#">
                Tweeter
            </a>
            <div className="navbar-default pull-right">
                <input placeholder="username" 
                    className={ username ? 'hidden' : 'navbar-default login-field'}                        
                    ref={ node => { 
                        newUsername = node                            
                    }}/>
                <input readOnly
                    className={ username ? 'navbar-default login-field welcome' : 'hidden'}
                    value={`Welcome ${username}!`}
                />
                <button className="btn btn-primary"
                    onClick={() => { onLoginClick(newUsername.value); newUsername.value = '' }}>
                    { username ? 'logout' : ' login' } 
                </button>            
            </div>
        </div>
    )
}

const mapStateToProps = (state) => {
    return { 
        username: state.username
    }
}

const mapDispatchToProps = (dispatch) => {
    return {        
        onLoginClick: (username) => {            
            dispatch(onLoginClick(username))
        }
    }
}

LoginView.propTypes = {
    username: PropTypes.string.isRequired,
    onLoginClick: PropTypes.func.isRequired
}

const Login = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoginView)

export default Login
