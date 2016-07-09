import _ from 'lodash'
import firebase from 'firebase'
import React from 'react'
import {Link} from 'react-router'

import FileManager from './filemanager'
import Nav from './nav'


const style = {
  bodyContainer: {
    padding: 30,
  },
}


const Home = React.createClass({
  render() {
    return (
      <div>
        <Nav user={this.props.user} />
        <div style={style.bodyContainer}>
          <FileManager user={this.props.user} />
        </div>
      </div>
    )
  }
})


export default Home
