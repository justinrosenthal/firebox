import _ from 'lodash'
import firebase from 'firebase'
import React from 'react'
import {Link} from 'react-router'

import FileManager from './filemanager'


const style = {
  navBar: {
    padding: '15px 30px',
    backgroundColor: '#F8F8F8',
    borderBottom: '1px solid #E7E7E7',
  },

  navBrand: {
    margin: 0,
    padding: 0,
    fontSize: 22,
  },

  navLogo: {
    width: 'auto',
    height: 35,
    marginTop: -7,
  },

  navRight: {
    float: 'right',
  },

  navEmail: {
    marginRight: 10,
  },

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

const Nav = React.createClass({
  handleLogout(e) {
    e.preventDefault()
    firebase.auth().signOut()
  },

  render() {
    return (
      <div style={style.navBar}>
        <div style={style.navRight}>
          <span style={style.navEmail}>{this.props.user.email}</span>
          <button onClick={this.handleLogout} className="btn btn-default">Logout</button>
        </div>

        <h1 style={style.navBrand}>
          <img style={style.navLogo} src="/img/FireboxBrand.png" /> Firebox
        </h1>
      </div>
    )
  }
})


export default Home
