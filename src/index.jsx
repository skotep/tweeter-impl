import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { createStore, applyMiddleware } from 'redux'

import tweetReducer from './reducers.jsx'
import App from './app.jsx'

import { startPolling } from './actions.jsx'

const logger = createLogger()

let store = createStore(tweetReducer, applyMiddleware(thunkMiddleware, logger))

startPolling()(store.dispatch)

render(
    <Provider store={store}>
        <App />
    </Provider>, 
    document.getElementById('app')
)
