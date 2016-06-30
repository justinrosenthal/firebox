import _ from 'lodash'
import firebase from 'firebase'
import React from 'react'
import {Link} from 'react-router'

import {File, Directory, FileSystem} from '../lib/filesystem'


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
      nodes: [],
    }
  },

  componentWillMount() {
    this.curDir = this.props.fileSystem.root
    this.curDir.register(children => {
      this.setState({nodes: children})
    })
  },

  componentWillUnmount() {
  },

  render() {
    return (
      <table className="table table-striped">
        <thead>
          <tr><th>Name</th><th>Created</th><th>Modified</th></tr>
        </thead>
        <tbody>
          {this.state.nodes.map(function(node) {
            if (node instanceof File) {
              var data = node.data
              return (
                <tr key={node.ref.key}>
                  <td><a href={data.downloadURL} target="_blank">{data.filename}</a></td>
                  <td>{new Date(data.timeCreated).toLocaleString()}</td>
                  <td>{new Date(data.timeModified).toLocaleString()}</td>
                </tr>
              )
            } else if (node instanceof Directory) {
              return (
                <tr key={node.ref.key}>
                  <td><a href="#" target="_blank">{node.name}</a></td>
                  <td></td>
                  <td></td>
                </tr>
              )
            }
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

  promptDirectory(e) {
    e.preventDefault()
    var name = prompt('Enter directory name:')
    this.props.fileSystem.root.addDirectory(name)
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
        <ul>
          <li><a href="#" onClick={this.promptUpload}>Upload a file...</a></li>
          <li><a href="#" onClick={this.promptDirectory}>Create a directory...</a></li>
        </ul>
      </div>
    )
  }
})


export default Home
