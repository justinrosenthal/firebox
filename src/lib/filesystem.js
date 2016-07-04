import _ from 'lodash'
import firebase from 'firebase'


class Node {
  constructor(type, name, ref) {
    this.type = type
    this.name = name
    this.ref = ref
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
    this.children = [];
    this.listeners = [];
    this.loaded = false;
  }

  register(cb) {
    if (!this.loaded) {
      this.storageRef.on('child_added', this._onChildAdded.bind(this))
      this.storageRef.on('child_removed', this._onChildRemoved.bind(this))
      this.loaded = true
    } else {
      cb(this.children)
    }
    this.listeners.push(cb)
  }

  unregister(cb) {
    this.listeners = _.remove(this.listeners, cb)
  }

  addFile(name, data) {
    this.storageRef.push({
      type: Node.FILE,
      name: name,
      data: data,
    })
  }

  addDirectory(name) {
    this.storageRef.push({
      type: Node.DIRECTORY,
      name: name,
    })
  }

  _notifyListeners() {
    _.each(this.listeners, listener => {
      listener(this.children)
    })
  }

  _onChildAdded(data) {
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
    this.children.push(node)
    this._notifyListeners()
  }

  _onChildRemoved(data) {
    this.children = _.filter(this.children, child => {
      return child.ref.key != data.key
    })
    this._notifyListeners()
  }
}

class FileSystem {
  constructor(user) {
    this.user = user
    this.root = new Directory(
      'root',
      firebase.database().ref('files/' + user.uid).child('root')
    )
  }
}


export {File, Directory, FileSystem}
