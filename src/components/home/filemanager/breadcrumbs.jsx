import React from 'react'


const style = {
  list: {
    float: 'left',
    margin: 0,
    padding: '0px 0px 0px 10px',
    backgroundColor: 'white',
    borderLeft: '5px solid #AB5153',
    borderRadius: 0,
  },

  active: {
    color: 'black',
  },
}


const Breadcrumbs = React.createClass({
  onClick(i, e) {
    e.preventDefault()
    this.props.onClickIndex(i)
  },

  render() {
    return (
      <ol className="breadcrumb" style={style.list}>
        {this.props.directories.map((dir, i) => {
          if (i === this.props.directories.length - 1) {
            return <li key={dir.ref.key} className="active" style={style.active}>{dir.name}</li>
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


export default Breadcrumbs
