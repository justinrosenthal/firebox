import firebase from 'firebase'
import React from 'react'


const style = {
  card: {
    maxWidth: 350,
    margin: '50px auto 25px',
    padding: '30px 40px 40px',
    backgroundColor: '#F7F7F7',
    borderRadius: 2,
    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.3)',
  },

  logo: {
    display: 'block',
    width: 96,
    height: 'auto',
    margin: '0 auto 30px',
  },

  inputField: {
    display: 'block',
    height: 44,
    marginBottom: 10,
    fontSize: 16,
  },

  submitButton: {
    height: 36,
    margin: '25px 0px',
    padding: 0,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#AB5153',
    borderRadius: 3,
    border: 'none',
  },

  error: {
    margin: 0,
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  }
}


const Card = React.createClass({
  render() {
    var error
    if (this.props.error) {
      error = (<p style={style.error}>{this.props.error}</p>)
    }

    return (
      <div>
        <div style={style.card}>
          <img style={style.logo} src="/img/FireboxLogo.png" />
          {this.props.children}
          {error}
        </div>
      </div>
    )
  }
})

const Login = React.createClass({
  getInitialState() {
    return {
      email: '',
      password: '',
      error: '',
    }
  },

  handleChange(key, e) {
    var newState = {}
    newState[key] = e.target.value
    this.setState(newState)
  },

  handleSubmit(e) {
    e.preventDefault()
    this.setState({error: ''})

    // Attempt to signup the user and send a welcome email
    firebase.auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((user) => {
        alert(user.uid)
      })
      .catch((error) => {
        this.setState({error: error.message})
      })
  },

  render() {
    return (
      <Card error={this.state.error}>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            className="form-control"
            style={style.inputField}
            placeholder="Email"
            value={this.state.email}
            onChange={this.handleChange.bind(null, 'email')} />
          <input
            type="password"
            className="form-control"
            style={style.inputField}
            placeholder="Password"
            value={this.state.password}
            onChange={this.handleChange.bind(null, 'password')} />

          <input
            type="submit"
            className="btn btn-lg btn-primary btn-block btn-signin"
            style={style.submitButton}
            value="Login" />
        </form>
      </Card>
    )
  }
})

const SignUp = React.createClass({
  getInitialState() {
    return {
      email: '',
      password: '',
      passwordConfirm: '',
      error: '',
    }
  },

  validate() {
    if (!this.state.email) {
      return 'Email is required'
    }
    if (!this.state.password) {
      return 'Password is required'
    }
    if (this.state.password !== this.state.passwordConfirm) {
      return 'Passwords do not match'
    }
  },

  handleChange(key, e) {
    var newState = {}
    newState[key] = e.target.value
    this.setState(newState)
  },

  handleSubmit(e) {
    e.preventDefault()
    this.setState({error: ''})

    // Handle local error cases
    var error = this.validate()
    if (error) {
      this.setState({error: error})
      return
    }

    // Attempt to signup the user and send a welcome email
    firebase.auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then((user) => {
        return user.sendEmailVerification()
      })
      .catch((error) => {
        this.setState({error: error.message})
      })
  },

  render() {
    return (
      <Card error={this.state.error}>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            className="form-control"
            style={style.inputField}
            placeholder="Email"
            value={this.state.email}
            onChange={this.handleChange.bind(null, 'email')} />
          <input
            type="password"
            className="form-control"
            style={style.inputField}
            placeholder="Password"
            value={this.state.password}
            onChange={this.handleChange.bind(null, 'password')} />
          <input
            type="password"
            className="form-control"
            style={style.inputField}
            placeholder="Repeat Password"
            value={this.state.passwordConfirm}
            onChange={this.handleChange.bind(null, 'passwordConfirm')} />

          <input
            type="submit"
            className="btn btn-lg btn-primary btn-block btn-signin"
            style={style.submitButton}
            value="Sign Up" />
        </form>
      </Card>
    )
  }
})


export {Login, SignUp}
