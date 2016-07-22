import _ from 'lodash'
import firebase from 'firebase'


class Node {
  constructor(type, name, ref) {
    this.type = type
    this.name = name
    this.ref = ref
  }

  close() {
  }

  remove() {
    this.ref.remove()
  }
}

Node.FILE = 0
Node.DIRECTORY = 1

class File extends Node {
  constructor(data, ref) {
    super(Node.FILE, data.filename, ref)
    this.data = data
  }
}

class Directory extends Node {
  constructor(name, ref) {
    super(Node.DIRECTORY, name, ref)
    this.storageRef = ref.key === 'root' ? ref : ref.parent.parent.child(ref.key)
    this.loading = true
    this.children = []
    this.listeners = []
  }

  open() {
    if (!this.query) {
      this.query = this.storageRef.orderByChild('name')
      this.query.on('child_added', this._onChildAdded.bind(this))
      this.query.on('child_removed', this._onChildRemoved.bind(this))
      this.query.limitToFirst(1).once('value', () => {
        this.loading = false
        this._notifyListeners()
      })
      return true
    }
    return false
  }

  close() {
    this.children.forEach(child => {
      child.close()
    })

    if (this.query) {
      this.query.off()
      delete this.query
    }
  }

  register(cb) {
    if (!this.open()) {
      cb(this.children)
    }
    this.listeners.push(cb)
  }

  unregister(cb) {
    this.listeners = _.remove(this.listeners, cb)
  }

  addFile(name, data) {
    if (!name) {
      return
    }
    this.storageRef.push({
      type: Node.FILE,
      name: name,
      data: data,
    })
  }

  addDirectory(name) {
    if (!name) {
      return
    }
    this.storageRef.push({
      type: Node.DIRECTORY,
      name: name,
    })
  }

  _notifyListeners() {
    if (this.loading) {
      return
    }
    _.each(this.listeners, listener => {
      listener(this.children)
    })
  }

  _onChildAdded(data, prevKey) {
    var node
    switch(data.val().type) {
      case Node.FILE:
        node = new File(data.val().data, data.ref)
        break
      case Node.DIRECTORY:
        node = new Directory(data.val().name, data.ref)
        break
    }
    if (!node) {
      return
    }

    // Insert the node at the sorted position
    var i = !prevKey ? -1 : _.findLastIndex(this.children, child => {
      return child.ref.key === prevKey
    })
    this.children.splice(i + 1, 0, node)

    this._notifyListeners()
  }

  _onChildRemoved(data) {
    this.children = _.filter(this.children, child => {
      return child.ref.key != data.key
    })
    this._notifyListeners()
  }
}

class Filesystem {
  constructor(user) {
    this.user = user
    this.root = new Directory(
      'Your Files',
      firebase.database().ref('users/' + user.uid + '/files/root')
    )
  }

  close() {
    this.root.close()
  }
}


export {File, Directory, Filesystem}
