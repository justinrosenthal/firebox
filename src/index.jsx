import firebase from 'firebase'
import React from 'react'
import {render} from 'react-dom'
import {browserHistory, Route, Router} from 'react-router'

import {Login, SignUp} from './auth'


const App = React.createClass({
  componentWillMount() {
    // Listen for authentication changes (login/logout)
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged)
  },

  onAuthStateChanged(user) {
    if (user) {
      // Logged in
      // TODO: Redirect to "home"
    } else {
      // Logged out (or never logged in)
      // Redirect to login screen and clear the browser history
      browserHistory.replace('/login')
    }
  },

  render() {
    return (
      <div>{this.props.children}</div>
    )
  }
})


render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="login" component={Login} />
      <Route path="signup" component={SignUp} />
    </Route>
  </Router>
), document.getElementById('app'))
