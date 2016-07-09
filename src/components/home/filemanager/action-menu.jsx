import _ from 'lodash'
import React from 'react'


const style = {
  container: {
    float: 'right',
    textAlign: 'right',
  },

  link: {
    color: 'black',
    marginLeft: 25,
  },

  icon: {
    fontSize: 22,
    verticalAlign: 'middle',
    color: '#AB5153',
  },
}


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
      <div style={style.container}>
        <input
          type="file"
          multiple
          className="hidden"
          ref="fileInput"
          onChange={this.handleUpload}
        />
        <Action title="Upload" icon="file_upload" onClick={this.promptUpload} />
        <Action title="New Folder" icon="create_new_folder" onClick={this.promptDirectory} />
      </div>
    )
  }
})

const Action = React.createClass({
  render() {
    return (
      <a href="#" style={style.link} onClick={this.props.onClick}>
        <i className="material-icons" style={style.icon}>
         {this.props.icon}
        </i>
        <span> {this.props.title}</span>
      </a>
    )
  }
})


export default ActionMenu
