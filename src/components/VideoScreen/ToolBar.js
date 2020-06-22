import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {CallService} from '../../services';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default class ToolBar extends Component {
  state = {
    isAudioMuted: false,
    isVideoHidden: false,
    isFrontCamera: true,
    isSpeakerOn: true,
  };

  static getDerivedStateFromProps(props, state) {
    if (!props.isActiveCall) {
      return {
        isAudioMuted: false,
        isFrontCamera: true,
      };
    }
  }

  startCall = () => {
    const {
      selectedUsersIds,
      closeSelect,
      initRemoteStreams,
      setLocalStream,
    } = this.props;

    if (selectedUsersIds.length === 0) {
      CallService.showToast('Select at less one user to start Videocall');
    } else {
      closeSelect();
      initRemoteStreams(selectedUsersIds);
      CallService.showToast('Calling Friends.');
      CallService.startCall(selectedUsersIds).then(setLocalStream);
    }
  };

  stopCall = () => {
    const {resetState} = this.props;

    CallService.stopCall();
    resetState();
  };

  switchCamera = () => {
    const {localStream} = this.props;

    CallService.switchCamera(localStream);
    this.setState(prevState => ({isFrontCamera: !prevState.isFrontCamera}));
  };

  speakerOn = () => {
    const {localStream} = this.props;

    CallService.setSpeakerphoneOn(localStream);
    this.setState(prevState => ({isSpeakerOn: !prevState.isSpeakerOn}));
  };

  muteUnmuteAudio = () => {
    this.setState(prevState => {
      const mute = !prevState.isAudioMuted;
      CallService.setAudioMuteState(mute);
      return {isAudioMuted: mute};
    });
  };

  hideVideo = () => {
    this.setState(prevState => {
      const video = !prevState.isVideoHidden;
      CallService.setVideoHideState(video);
      return {isVideoHidden: video};
    });
  };

  _renderCallStartStopButton = isCallInProgress => {
    const style = isCallInProgress ? styles.buttonCallEnd : styles.buttonCall;
    const onPress = isCallInProgress ? this.stopCall : this.startCall;
    const type = isCallInProgress ? 'call-end' : 'call';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, style, styles.callButton]}
        onPress={onPress}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  _renderMuteButton = () => {
    const {isAudioMuted} = this.state;
    const type = isAudioMuted ? 'mic-off' : 'mic';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonMute]}
        onPress={this.muteUnmuteAudio}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  _renderSwitchVideoSourceButton = () => {
    const {isFrontCamera} = this.state;
    const type = isFrontCamera ? 'camera-rear' : 'camera-front';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonSwitch]}
        onPress={this.switchCamera}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  _renderChangeAudioModeButton = () => {
    const {isSpeakerOn} = this.state;
    const type = isSpeakerOn ? 'headset-mic' : 'volume-up';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonAudio]}
        onPress={this.speakerOn}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  _renderChangeVideoModeButton = () => {
    const {isVideoHidden} = this.state;
    const type = isVideoHidden ? 'videocam-off' : 'videocam';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonVideo]}
        onPress={this.hideVideo}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  render() {
    const {isActiveSelect, isActiveCall} = this.props;
    const isCallInProgress = isActiveCall || !isActiveSelect;
    const isAvailableToSwitch =
      isActiveCall && CallService.mediaDevices.length > 1;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.toolBarItem}>
          {isActiveCall && this._renderChangeVideoModeButton()}
        </View>
        <View style={styles.toolBarItem}>
          {isActiveCall && this._renderMuteButton()}
        </View>
        <View style={styles.toolBarItem}>
          {this._renderCallStartStopButton(isCallInProgress)}
        </View>
        <View style={styles.toolBarItem}>
          {isAvailableToSwitch && this._renderSwitchVideoSourceButton()}
        </View>
        <View style={styles.toolBarItem}>
          {isActiveCall && this._renderChangeAudioModeButton()}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 60,
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  toolBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCall: {
    backgroundColor: '#35ff35',
  },
  buttonCallEnd: {
    backgroundColor: '#ff0000',
  },
  buttonMute: {
    backgroundColor: '#ba9800',
  },
  buttonSwitch: {
    backgroundColor: '#7900d9',
  },
  buttonAudio: {
    backgroundColor: '#ea6700',
  },
  buttonVideo: {
    backgroundColor: '#c72c00',
  },
  callButton: {
    height: 60,
    width: 60,
  },
});
