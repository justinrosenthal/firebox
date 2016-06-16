import _ from 'lodash'
import {EventEmitter} from 'events'
import firebase from 'firebase'


class File {
  constructor(key, data) {
    this.key = key
    this.data = data
  }
}

class FileSystem extends EventEmitter {
  constructor(user) {
    super()
    this.user = user
    this.files = []

    // Hold refs to this user's personal directories
    this.baseStorageRef = firebase.storage().ref('u/' + user.uid)
    this.baseDatabaseRef = firebase.database().ref('files/' + user.uid)
  }

  start() {
    // Fetch current files and listen for changes
    this.baseDatabaseRef.on('child_added', this._onChildAdded.bind(this))
  }

  stop() {
    this.baseDatabaseRef.off()
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

  _onChildAdded(data) {
    this.files.push(new File(data.key, data.val()))
    this.emit('change')
  }

  _onUploadSuccess(snapshot) {
    var metadata = snapshot.metadata
    var ref = this.baseDatabaseRef.push()
    ref.set({
      filename: metadata.customMetadata.filename,
      path: metadata.fullPath,
      downloadURL: snapshot.downloadURL,
      contentType: metadata.contentType,
      timeCreated: metadata.timeCreated,
      timeModified: metadata.updated,
    })
  }
}


export default FileSystem
