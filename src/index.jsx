import firebase from 'firebase'
import React from 'react'
import {render} from 'react-dom'
import {browserHistory, Route, Router} from 'react-router'

import {Login, SignUp} from './auth'
import Home from './home'


const App = React.createClass({
  getInitialState() {
    return {
      user: undefined,
    }
  },

  componentWillMount() {
    // Listen for authentication changes (login/logout)
    // Exceptions are being caught, so jumping out of firebase call stack
    firebase.auth().onAuthStateChanged((user) => {
      setTimeout(() => { this.onAuthStateChanged(user) }, 0)
    })
  },

  onAuthStateChanged(user) {
    this.setState({user: user})

    if (this.state.user) {
        // Logged in
        browserHistory.push('/home')
    } else {
        // Logged out (or never logged in)
        // Redirect to login screen and clear the browser history
        browserHistory.replace('/login')
    }
  },

  render() {
    return (
      <div>
        {this.props.children && React.cloneElement(this.props.children, {
          user: this.state.user,
        })}
      </div>
    )
  }
})

const ProtectedHome = React.createClass({
  render() {
    if (this.props.user) {
      return <Home {...this.props} />
    } else {
      return <div />
    }
  }
})


render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="home" component={ProtectedHome} />
      <Route path="login" component={Login} />
      <Route path="signup" component={SignUp} />
    </Route>
  </Router>
), document.getElementById('app'))
