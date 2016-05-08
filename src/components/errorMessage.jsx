import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

const ErrorMessage = ({error}) => (
    <div className="alert alert-danger" 
        style={{ display: error.length ? 'block' : 'none' }}>
        { error }
    </div>    
)

ErrorMessage.propTypes = {
    error: PropTypes.string.isRequired
}

export default connect((state) => {
    return { error: state.error}
})(ErrorMessage)