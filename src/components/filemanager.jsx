import _ from 'lodash'
import React from 'react'

import BlobStore from '../lib/blobstore'
import {File, Directory, FileSystem} from '../lib/filesystem'


const FileManager = React.createClass({
  getInitialState() {
    return {
      stack: [],
    }
  },

  componentWillMount() {
    this.fs = new FileSystem(this.props.user)
    this.bs = new BlobStore(this.props.user)
    this.pushDirectory(this.fs.root)
  },

  currentDirectory() {
    return this.state.stack[this.state.stack.length - 1]
  },

  pushDirectory(dir) {
    this.setState({stack: this.state.stack.concat([dir])})
  },

  popDirectory() {
    if (this.state.stack.length > 1) {
      this.popToIndex(this.state.stack.length - 1)
    }
  },

  popToIndex(i) {
    if (i >= 0) {
      this.setState({stack: this.state.stack.slice(0, i + 1)})
    }
  },

  handleUpload(browserFile) {
    var dir = this.currentDirectory()
    this.bs.upload(browserFile, (err, snapshot) => {
      if (err) {
        console.log(err)
        return
      }

      var metadata = snapshot.metadata
      dir.addFile(metadata.customMetadata.filename, {
        filename: metadata.customMetadata.filename,
        path: metadata.fullPath,
        downloadURL: snapshot.downloadURL,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        timeModified: metadata.updated,
      })
    })
  },

  handleCreateDirectory(name) {
    this.currentDirectory().addDirectory(name)
  },

  render() {
    return (
      <div className="row">
        <div className="col-md-9">
          <Breadcrumbs directories={this.state.stack} onClickIndex={this.popToIndex} />
          <DirectoryView dir={this.currentDirectory()} pushDirectory={this.pushDirectory} />
        </div>
        <div className="col-md-3">
          <ActionMenu
            handleUpload={this.handleUpload}
            handleCreateDirectory={this.handleCreateDirectory}
          />
        </div>
      </div>
    )
  }
})

const Breadcrumbs = React.createClass({
  onClick(i, e) {
    e.preventDefault()
    this.props.onClickIndex(i)
  },

  render() {
    return (
      <ol className="breadcrumb">
        {this.props.directories.map((dir, i) => {
          if (i === this.props.directories.length - 1) {
            return <li key={dir.ref.key} className="active">{dir.name}</li>
          } else {
            return (
              <li key={dir.ref.key}>
                <a href="#" onClick={this.onClick.bind(this, i)}>{dir.name}</a>
              </li>
            )
          }
        })}
      </ol>
    )
  }
})

const DirectoryView = React.createClass({
  getInitialState() {
    return {
      nodes: [],
    }
  },

  componentWillMount() {
    this.load(this.props)
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.dir !== nextProps.dir) {
      this.load(nextProps)
    }
  },

  load(props) {
    props.dir.unregister(this.onDirectoryChanged)
    this.setState({nodes: []})
    props.dir.register(this.onDirectoryChanged)
  },

  onDirectoryChanged(nodes) {
    this.setState({nodes: nodes})
  },

  onDirectoryClicked(dir) {
    this.props.pushDirectory(dir)
  },

  render() {
    return (
      <table className="table table-striped">
        <thead>
          <tr><th>Name</th><th>Created</th><th>Modified</th></tr>
        </thead>
        <tbody>
          {this.state.nodes.map(node => {
            if (node instanceof File) {
              return <FileRow file={node} key={node.ref.key} />
            } else if (node instanceof Directory) {
              return (
                <DirectoryRow
                  dir={node}
                  key={node.ref.key}
                  onClick={this.onDirectoryClicked}
                />
              )
            }
          })}
        </tbody>
      </table>
    )
  }
})

const FileRow = React.createClass({
  render() {
    var data = this.props.file.data
    return (
      <tr>
        <td><a href={data.downloadURL} target="_blank">{data.filename}</a></td>
        <td>{new Date(data.timeCreated).toLocaleString()}</td>
        <td>{new Date(data.timeModified).toLocaleString()}</td>
      </tr>
    )
  }
})

const DirectoryRow = React.createClass({
  onClick(e) {
    e.preventDefault()
    this.props.onClick(this.props.dir)
  },

  render() {
    return (
      <tr>
        <td>
          <a href="#" onClick={this.onClick}>
            {this.props.dir.name}
          </a>
        </td>
        <td></td>
        <td></td>
      </tr>
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
      this.props.handleUpload(file)
    })
  },

  promptDirectory(e) {
    e.preventDefault()
    var name = prompt('Enter directory name:')
    this.props.handleCreateDirectory(name)
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


export default FileManager
