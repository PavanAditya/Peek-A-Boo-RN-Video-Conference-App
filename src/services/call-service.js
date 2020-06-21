import {Platform, ToastAndroid} from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import {users} from '../helpers/config';
import AuthService from 'react-native-connectycube/lib/cubeAuth';
import {showAlert} from '../helpers/Alert';

export default class CallService {
  static MEDIA_OPTIONS = {audio: true, video: {facingMode: 'user'}};

  _session = null;
  mediaDevices = [];

  outgoingCall = new Sound(require('../../assets/sounds/dialing.mp3'));
  incomingCall = new Sound(require('../../assets/sounds/calling.mp3'));
  endCall = new Sound(require('../../assets/sounds/end_call.mp3'));

  showToast = text => {
    const commonToast = Platform.OS === 'android' ? ToastAndroid : Toast;

    commonToast.showWithGravity(text, Toast.LONG, Toast.TOP);
  };

  getUserNameById = (userId, key) => {
    const user = users.find(user => user.id == userId);

    if (typeof key === 'string') {
      return user[key];
    }

    return user;
  };

  getUserById = async (id, key) => {
    let allUsers = [await ConnectyCube.users.get(id)];
    console.log(allUsers, 'a;lllkhjg');
    console.log(allUsers[0].user, 'a;lllkhjg user');
    const contacts = allUsers.filter(ele => ele.user.id === id);

    console.log(contacts, 'a;lllkhjg filtered');
    if (key === 'name') {
      return contacts[0].user.full_name;
    } else {
      return contacts[0].user[key];
    }
  };

  getUserByLogin = async (loginName, ignoreUser) => {
    // if (!ignoreUser) {
    //   ignoreUser = [this.currentUser.id];
    // }
    let allUsers;
    let contacts = [];
    try {
      allUsers = [
        await ConnectyCube.users.get({
          per_page: 100,
          login: loginName,
        }),
      ];
      allUsers.forEach(elem => {
        if (!ignoreUser.includes(elem.user.login)) {
          contacts.push(elem.user);
        } else {
          showAlert("You can't add yourself", 'Ooopss');
        }
      });
    } catch (err) {
      showAlert("Couldn't find the User with login Name:\n" + loginName, '404');
    }
    console.log(contacts, 'vrey before');
    return contacts;
  };

  setMediaDevices() {
    return ConnectyCube.videochat.getMediaDevices().then(mediaDevices => {
      this.mediaDevices = mediaDevices;
    });
  }

  acceptCall = session => {
    this.stopSounds();
    this._session = session;
    this.setMediaDevices();

    return this._session
      .getUserMedia(CallService.MEDIA_OPTIONS)
      .then(stream => {
        this._session.accept({});
        return stream;
      });
  };

  startCall = async ids => {
    const options = {};
    const type = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible

    console.log(ids, 'callers list');
    console.log(type, 'callers list');
    console.log(options, 'callers list');
    this._session = await ConnectyCube.videochat.createNewSession(
      ids,
      type,
      options,
    );
    this.setMediaDevices();
    this.playSound('outgoing');

    return this._session
      .getUserMedia(CallService.MEDIA_OPTIONS)
      .then(stream => {
        this._session.call({});
        return stream;
      });
  };

  stopCall = () => {
    this.stopSounds();

    if (this._session) {
      this.playSound('end');
      this._session.stop({});
      ConnectyCube.videochat.clearSession(this._session.ID);
      this._session = null;
      this.mediaDevices = [];
    }
  };

  rejectCall = (session, extension) => {
    this.stopSounds();
    session.reject(extension);
  };

  setAudioMuteState = mute => {
    if (mute) {
      this._session.mute('audio');
    } else {
      this._session.unmute('audio');
    }
  };

  switchCamera = localStream => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };

  setSpeakerphoneOn = flag => InCallManager.setSpeakerphoneOn(flag);

  processOnUserNotAnswerListener(userId) {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        console.log('3');
        const userName = this.getUserById(userId, 'name');
        const message = `${userName} did not answer`;

        this.showToast(message);

        resolve();
      }
    });
  }

  processOnCallListener(session) {
    return new Promise((resolve, reject) => {
      if (session.initiatorID === session.currentUserID) {
        reject();
      }

      if (this._session) {
        this.rejectCall(session, {busy: true});
        reject();
      }

      this.playSound('incoming');

      resolve();
    });
  }

  processOnAcceptCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        this.showToast('You have accepted the call on other side');

        reject();
      } else {
        console.log('4');
        const userName = this.getUserById(userId, 'name');
        const message = `${userName} has accepted the call`;

        this.showToast(message);
        this.stopSounds();

        resolve();
      }
    });
  }

  processOnRejectCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        this.showToast('You have rejected the call on other side');

        reject();
      } else {
        console.log('5');
        const userName = this.getUserById(userId, 'name');
        const message = extension.busy
          ? `${userName} is busy`
          : `${userName} rejected the call request`;

        this.showToast(message);

        resolve();
      }
    });
  }

  processOnStopCallListener(userId, isInitiator) {
    return new Promise((resolve, reject) => {
      this.stopSounds();

      if (!this._session) {
        reject();
      } else {
        console.log('6');
        const userName = this.getUserById(userId, 'name');
        const message = `${userName} has ${
          isInitiator ? 'stopped' : 'left'
        } the call`;

        this.showToast(message);

        resolve();
      }
    });
  }

  processOnRemoteStreamListener = () => {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        resolve();
      }
    });
  };

  playSound = type => {
    switch (type) {
      case 'outgoing':
        this.outgoingCall.setNumberOfLoops(-1);
        this.outgoingCall.play();
        break;
      case 'incoming':
        this.incomingCall.setNumberOfLoops(-1);
        this.incomingCall.play();
        break;
      case 'end':
        this.endCall.play();
        break;

      default:
        break;
    }
  };

  stopSounds = () => {
    if (this.incomingCall.isPlaying()) {
      this.incomingCall.pause();
    }
    if (this.outgoingCall.isPlaying()) {
      this.outgoingCall.pause();
    }
  };
}
