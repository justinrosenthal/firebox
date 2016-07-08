import _ from 'lodash'
import React from 'react'

import BlobStore from '../lib/blobstore'
import {File, Directory, FileSystem} from '../lib/filesystem'


const style = {
  header: {
    width: '100%',
    overflow: 'auto',
    marginBottom: 30,
    fontSize: 18,
    fontWeight: 'bold',
  },

  breadcrumbList: {
    float: 'left',
    margin: 0,
    padding: '0px 0px 0px 10px',
    backgroundColor: 'white',
    borderLeft: '5px solid #AB5153',
    borderRadius: 0,
  },

  breadcrumbActive: {
    color: 'black',
  },

  actionMenu: {
    float: 'right',
    textAlign: 'right',
  },

  actionMenuLink: {
    color: 'black',
    marginLeft: 25,
  },

  actionMenuIcon: {
    fontSize: 22,
    verticalAlign: 'middle',
    color: '#AB5153',
  },

  tableHeader: {
    borderBottom: '1px solid black',
  },

  nodeIcon: {
    fontSize: 18,
  },

  actionButton: {
    marginRight: 5,
  },

  actionButtonIcon: {
    fontSize: 18,
    verticalAlign: 'middle',
  },
}


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
        console.error(err)
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
      <div>
        <div style={style.header}>
          <Breadcrumbs directories={this.state.stack} onClickIndex={this.popToIndex} />
          <ActionMenu
            handleUpload={this.handleUpload}
            handleCreateDirectory={this.handleCreateDirectory}
          />
        </div>
        <DirectoryView dir={this.currentDirectory()} pushDirectory={this.pushDirectory} />
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
      <ol className="breadcrumb" style={style.breadcrumbList}>
        {this.props.directories.map((dir, i) => {
          if (i === this.props.directories.length - 1) {
            return <li key={dir.ref.key} className="active" style={style.breadcrumbActive}>{dir.name}</li>
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
      this.props.dir.unregister(this.onDirectoryChanged)
      this.load(nextProps)
    }
  },

  load(props) {
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
          <tr>
            <th width="3%" style={style.tableHeader}></th>
            <th width="47%" style={style.tableHeader}>Name</th>
            <th width="25%" style={style.tableHeader}>Created At</th>
            <th width="25%" style={style.tableHeader}>Actions</th>
          </tr>
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
  handleDownload(e) {
    e.preventDefault()
    this.refs.downloadLink.click()
  },

  handleDelete(e) {
    e.preventDefault()
    this.props.file.remove()
  },

  render() {
    var data = this.props.file.data
    return (
      <tr>
        <td><i className="material-icons" style={style.nodeIcon}>insert_drive_file</i></td>
        <td><a href={data.downloadURL} target="_blank">{data.filename}</a></td>
        <td>{new Date(data.timeCreated).toLocaleString()}</td>
        <td>
          <a href={data.downloadURL} download ref="downloadLink" />
          <button
            className="btn btn-default btn-xs"
            style={style.actionButton}
            title="Download"
            onClick={this.handleDownload}>
            <i className="material-icons" style={style.actionButtonIcon}>file_download</i>
          </button>

          <button
            className="btn btn-default btn-xs"
            style={style.actionButton}
            title="Delete"
            onClick={this.handleDelete}>
            <i className="material-icons" style={style.actionButtonIcon}>delete</i>
          </button>
        </td>
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
        <td><i className="material-icons" style={style.nodeIcon}>folder</i></td>
        <td>
          <a href="#" onClick={this.onClick}>
            {this.props.dir.name}
          </a>
        </td>
        <td>-</td>
        <td>-</td>
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
      <div style={style.actionMenu}>
        <input
          type="file"
          multiple
          className="hidden"
          ref="fileInput"
          onChange={this.handleUpload}
        />
        <a href="#" style={style.actionMenuLink} onClick={this.promptUpload}>
          <i className="material-icons" style={style.actionMenuIcon}>file_upload</i> Upload
        </a>
        <a href="#" style={style.actionMenuLink} onClick={this.promptDirectory}>
          <i className="material-icons" style={style.actionMenuIcon}>create_new_folder</i> New Folder
        </a>
      </div>
    )
  }
})


export default FileManager
