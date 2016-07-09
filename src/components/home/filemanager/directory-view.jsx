import React from 'react'

import {File, Directory} from '../../../lib/filesystem'


const style = {
  tableHeader: {
    borderBottom: '1px solid black',
  },

  tableRow: {
    height: 50,
  },

  tableCell: {
    verticalAlign: 'middle',
  },

  nodeIcon: {
    fontSize: 18,
  },

  actionButton: {
    width: 30,
    height: 30,
    marginRight: 5,
  },

  actionButtonIcon: {
    fontSize: 18,
    verticalAlign: 'middle',
  },
}


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
      <tr style={style.tableRow}>
        <td style={style.tableCell}>
          <i className="material-icons" style={style.nodeIcon}>insert_drive_file</i>
        </td>
        <td style={style.tableCell}>
          <a href={data.downloadURL} target="_blank">{data.filename}</a>
        </td>
        <td style={style.tableCell}>
          {new Date(data.timeCreated).toLocaleString()}
        </td>
        <td style={style.tableCell}>
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
      <tr style={style.tableRow}>
        <td style={style.tableCell}>
          <i className="material-icons" style={style.nodeIcon}>folder</i>
        </td>
        <td style={style.tableCell}>
          <a href="#" onClick={this.onClick}>
            {this.props.dir.name}
          </a>
        </td>
        <td style={style.tableCell}>-</td>
        <td style={style.tableCell}>-</td>
      </tr>
    )
  }
})


export default DirectoryView
