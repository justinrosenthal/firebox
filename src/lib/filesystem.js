import _ from 'lodash'
import firebase from 'firebase'


class Node {
  constructor(type, name, ref) {
    this.type = type
    this.name = name
    this.ref = ref
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
      this.loaded = true
    } else {
      cb(this.children)
    }
    this.listeners.push(cb)
  }

  unregister(cb) {
    _.remove(this.listeners, cb)
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
    _.each(this.listeners, listener => {
      listener(this.children)
    })
  }
}

class FileSystem {
  constructor(user) {
    this.user = user

    // Hold refs to this user's personal directories
    this.baseStorageRef = firebase.storage().ref('u/' + user.uid)
    this.baseDatabaseRef = firebase.database().ref('files/' + user.uid)

    this.root = new Directory( 'root', this.baseDatabaseRef.child('root'))
  }

  add(browserFile) {
    // Construct a new unique filename
    var filename = Date.now() + '-' + _.random(0, 100000000)
    var parts = browserFile.name.split('.')
    if (parts.length > 1) {
      filename += '.' + parts[parts.length - 1]
    }

    // Begin upload
    var ref = this.baseStorageRef.child(filename)
    var uploadTask = ref.put(browserFile, {
      customMetadata: {
        filename: browserFile.name,
      }
    })
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, {
      complete: () => {
        this._onUploadSuccess(uploadTask.snapshot)
      }
    })
  }

  _onUploadSuccess(snapshot) {
    var metadata = snapshot.metadata
    this.root.addFile(metadata.customMetadata.filename, {
      filename: metadata.customMetadata.filename,
      path: metadata.fullPath,
      downloadURL: snapshot.downloadURL,
      contentType: metadata.contentType,
      timeCreated: metadata.timeCreated,
      timeModified: metadata.updated,
    })
  }
}


export {File, Directory, FileSystem}
