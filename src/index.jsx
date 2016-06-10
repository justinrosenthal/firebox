import React from 'react'
import {render} from 'react-dom'
import {browserHistory, Route, Router} from 'react-router'

import {Login, SignUp} from './auth'


class App extends React.Component {
  render() {
    return (
      <div>{this.props.children}</div>
    )
  }
}


render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="login" component={Login} />
      <Route path="signup" component={SignUp} />
    </Route>
  </Router>
), document.getElementById('app'))
