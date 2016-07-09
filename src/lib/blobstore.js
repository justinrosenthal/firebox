import firebase from 'firebase'


class Blobstore {
  constructor(user) {
    this.user = user
    this.baseStorageRef = firebase.storage().ref('u/' + user.uid)
  }

  upload(browserFile, cb) {
    // Construct a new unique filename
    var filename = Date.now() + '-' + _.random(0, 100000000)
    var parts = browserFile.name.split('.')
    if (parts.length > 1) {
      filename += '.' + parts[parts.length - 1]
    }

    // Begin upload
    var ref = this.baseStorageRef.child(filename)
    var uploadTask = ref.put(browserFile, {
      contentDisposition: 'filename="' + browserFile.name + '"',
      customMetadata: {
        filename: browserFile.name,
      }
    })
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, {
      complete: () => {
        cb && cb(null, uploadTask.snapshot)
      }
    })
  }
}


export default Blobstore
