
import { LOGIN_OR_LOGOUT, UPDATE_TWEETS, ERROR } from './actions.jsx'

export default function tweetReducer(state = {
    error: '', username: '', tweets: []
}, action) {    
    switch(action.type) {
        case LOGIN_OR_LOGOUT:
            return { ...state, 
                username: state.username ? '' : action.username,                
                error: state.username ? '' : (action.username.length > 0 ? '' : 'please enter a username')
            }
        case UPDATE_TWEETS:
            return { ...state, tweets: action.tweets }
        case ERROR:
            return { ...state, error: action.error }
        default:
            return state
    }
}
