import _ from 'lodash'
import firebase from 'firebase'
import React from 'react'
import {Link} from 'react-router'

import FileManager from './filemanager'


const style = {
  homeContainer: {
    padding: 20,
  },

  navLogo: {
    width: 'auto',
    height: 35,
    marginTop: -7,
  },
}


const Home = React.createClass({
  render() {
    return (
      <div style={style.homeContainer}>
        <Nav user={this.props.user} />
        <FileManager user={this.props.user} />
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
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <div className="navbar-header">
            <Link to="/home" className="navbar-brand">
              <img style={style.navLogo} src="/img/FireboxBrand.png" />
            </Link>
          </div>
          <div className="navbar-header">
            <Link to="/home" className="navbar-brand">
              Firebox
            </Link>
          </div>

          <form onSubmit={this.handleLogout} className="navbar-form navbar-right">
            <button type="submit" className="btn btn-default">Logout</button>
          </form>
          <p className="navbar-text navbar-right">
            {this.props.user.email}
          </p>
        </div>
      </nav>
    )
  }
})


export default Home
