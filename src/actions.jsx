import Promise from 'bluebird'
import fetch from 'isomorphic-fetch'

export const LOGIN_OR_LOGOUT = 'LOGIN_OR_LOGOUT'
export const UPDATE_TWEETS = 'UDPATE_TWEETS'
export const ERROR = 'ERROR'

// TODO need to poll the server 
const SERVER_POLLING_INTERVAL = 60000;

export function onLoginClick(username) {
    return { type: LOGIN_OR_LOGOUT, username }
}

export function addTweet(body) {
    return (dispatch, getState) => {
        if (getState().username && body) {
            fetch('/tweet', {
                method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ body: body, author: getState().username })
            }).then(function(response) {
                return response.json()
            }).then((newTweet) => {
                dispatch(updateTweets([ newTweet, ...getState().tweets ]))
            }).catch((err) => {            
                console.log('there was an error', err)
                dispatch(updateError(err))            
            })
        }
    }
}

export function updateTweets(tweets) {
    return { type: UPDATE_TWEETS, tweets }
}

export function updateError(error) {
    return { type: ERROR, error }
}

export function startPolling() {
    return getTweets
}

const getTweets = (dispatch) => {
    console.log('poll server...')
    fetch('/tweet').then(function(response) {
        return response.json()
    }).then((json) => {        
        json.tweets.sort((b,a) => { 
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() 
        })
        dispatch(updateTweets(json.tweets))
        setTimeout(getTweets, SERVER_POLLING_INTERVAL, dispatch)
    }).catch((err) => {
        console.log('there was an error', err)
        dispatch(updateError(err))
    })
}
