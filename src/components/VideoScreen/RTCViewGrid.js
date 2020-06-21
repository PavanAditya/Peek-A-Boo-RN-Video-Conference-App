import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {RTCView} from 'react-native-connectycube';
import {CallService} from '../../services';
import CallingLoader from './CallingLoader';

export default ({streams}) => {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [name3, setName3] = useState('');
  const [name4, setName4] = useState('');

  const getUserName1 = async userId => {
    setName1(await CallService.getUserById(userId, 'name'));
  };

  const getUserName2 = async userId => {
    setName2(await CallService.getUserById(userId, 'name'));
  };

  const getUserName3 = async userId => {
    setName3(await CallService.getUserById(userId, 'name'));
  };

  const getUserName4 = async userId => {
    setName4(await CallService.getUserById(userId, 'name'));
  };

  const RTCViewRendered = ({userId, stream, name, index}) => {
    if (stream) {
      return (
        <RTCView
          objectFit="cover"
          style={styles.blackView}
          key={userId}
          streamURL={stream.toURL()}
        />
      );
    }

    console.log('2');
    index === 0
      ? getUserName1(userId)
      : index === 1
      ? getUserName2(userId)
      : index === 2
      ? getUserName3(userId)
      : getUserName4(userId);
    return (
      <View style={styles.blackView}>
        <CallingLoader
          name={
            index === 0
              ? name1
              : index === 1
              ? name2
              : index === 2
              ? name3
              : name4
          }
        />
      </View>
    );
  };

  const streamsCount = streams.length;

  let RTCListView = null;

  switch (streamsCount) {
    case 1:
      RTCListView = (
        <RTCViewRendered
          userId={streams[0].userId}
          stream={streams[0].stream}
          name={name1}
          index={0}
        />
      );
      break;

    case 2:
      RTCListView = (
        <View style={styles.inColumn}>
          <RTCViewRendered
            userId={streams[0].userId}
            stream={streams[0].stream}
            name={name1}
            index={0}
          />
          <RTCViewRendered
            userId={streams[1].userId}
            stream={streams[1].stream}
            name={name2}
            index={1}
          />
        </View>
      );
      break;

    case 3:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <RTCViewRendered
              userId={streams[0].userId}
              stream={streams[0].stream}
              name={name1}
              index={0}
            />
            <RTCViewRendered
              userId={streams[1].userId}
              stream={streams[1].stream}
              name={name2}
              index={1}
            />
          </View>
          <RTCViewRendered
            userId={streams[2].userId}
            stream={streams[2].stream}
            name={name3}
            index={2}
          />
        </View>
      );
      break;

    case 4:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <RTCViewRendered
              userId={streams[0].userId}
              stream={streams[0].stream}
              name={name1}
              index={0}
            />
            <RTCViewRendered
              userId={streams[1].userId}
              stream={streams[1].stream}
              name={name2}
              index={1}
            />
          </View>
          <View style={styles.inRow}>
            <RTCViewRendered
              userId={streams[2].userId}
              stream={streams[2].stream}
              name={name3}
              index={2}
            />
            <RTCViewRendered
              userId={streams[3].userId}
              stream={streams[3].stream}
              name={name4}
              index={3}
            />
          </View>
        </View>
      );
      break;

    default:
      break;
  }

  return <View style={styles.blackView}>{RTCListView}</View>;
};

const styles = StyleSheet.create({
  blackView: {
    flex: 1,
    backgroundColor: '#001a15',
  },
  inColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  inRow: {
    flex: 1,
    flexDirection: 'row',
  },
});
