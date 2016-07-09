import _ from 'lodash'
import React from 'react'

import ActionMenu from './action-menu'
import Blobstore from '../../../lib/blobstore'
import Breadcrumbs from './breadcrumbs'
import DirectoryView from './directory-view'
import {Filesystem} from '../../../lib/filesystem'


const style = {
  header: {
    width: '100%',
    overflow: 'auto',
    marginBottom: 30,
    fontSize: 18,
    fontWeight: 'bold',
  },
}


const FileManager = React.createClass({
  getInitialState() {
    return {
      stack: [],
    }
  },

  componentWillMount() {
    this.fs = new Filesystem(this.props.user)
    this.bs = new Blobstore(this.props.user)
    this.pushDirectory(this.fs.root)
  },

  componentWillUnmount() {
    this.fs.close()
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


export default FileManager
