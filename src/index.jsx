import React from 'react'
import {render} from 'react-dom'

import {Login, SignUp} from './auth'


class App extends React.Component {
  render() {
    return (<SignUp />)
  }
}


render(<App/>, document.getElementById('app'))
