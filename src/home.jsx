import _ from 'lodash'
import firebase from 'firebase'
import React from 'react'
import {Link} from 'react-router'

import FileSystem from './filesystem'


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
  componentWillMount() {
    this.fs = new FileSystem(this.props.user)
    this.fs.start()
  },

  componentWillUnmount() {
    this.fs.stop()
  },

  render() {
    return (
      <div style={style.homeContainer}>
        <Nav user={this.props.user} />

        <div className="row">
          <div className="col-md-9">
            <FileManager fileSystem={this.fs} />
          </div>
          <div className="col-md-3">
            <ActionMenu fileSystem={this.fs} />
          </div>
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

const FileManager = React.createClass({
  getInitialState() {
    return {
      files: [],
    }
  },

  componentWillMount() {
    this.props.fileSystem.on('change', this._onFileSystemChange)
  },

  componentWillUnmount() {
    this.props.fileSystem.removeListener('change', this._onFileSystemChange)
  },

  _onFileSystemChange() {
    this.setState({files: this.props.fileSystem.files})
  },

  render() {
    return (
      <table className="table table-striped">
        <thead>
          <tr><th>Name</th><th>Created</th><th>Modified</th></tr>
        </thead>
        <tbody>
          {this.state.files.map(function(file) {
            var data = file.data
            return (
              <tr key={file.key}>
                <td><a href={data.downloadURL} target="_blank">{data.filename}</a></td>
                <td>{new Date(data.timeCreated).toLocaleString()}</td>
                <td>{new Date(data.timeModified).toLocaleString()}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
})

const ActionMenu = React.createClass({
  promptUpload(e) {
    e.preventDefault()
    this.refs.fileInput.click()
  },

  handleUpload(e) {
    _.each(e.target.files, file => {
      this.props.fileSystem.add(file)
    })
  },

  render() {
    return (
      <div>
        <input
          type="file"
          multiple
          className="hidden"
          ref="fileInput"
          onChange={this.handleUpload}
        />
        <a href="#" onClick={this.promptUpload}>Upload a file...</a>
      </div>
    )
  }
})


export default Home
