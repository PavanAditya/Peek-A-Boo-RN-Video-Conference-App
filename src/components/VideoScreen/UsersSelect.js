/* eslint-disable eqeqeq */
/* eslint-disable no-alert */
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {CallService, AuthService} from '../../services';
import {showAlert} from '../../helpers/Alert';
import AuthScreen from '../AuthScreen';

const SIZE_SCREEN = Dimensions.get('window');

export default ({
  navigation,
  isActiveSelect,
  opponentsIds,
  selectedUsersIds,
  currentUserLoginId,
  currentUserFullName,
  selectUser,
  unselectUser,
}) => {
  if (!isActiveSelect) {
    return null;
  }

  const [contactsList, setContactsList] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const colors = [
    '#008080',
    '#e20056',
    '#7900d9',
    '#00912b',
    '#d1383d',
    '#39739d',
    '#ea6700',
    '#c72c00',
    '#c7284e',
    '#ba9800',
  ];

  const randomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const checkValidLoginName = () => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(searchValue).toLowerCase());
  };

  const logout = () => {
    Alert.alert(
      'Caution!',
      'You sure you want to logout?',
      [
        {
          text: 'Yes',
          onPress: () => {
            AuthService.logout();
            navigation.push('AuthScreen');
          },
          style: 'cancel',
        },
        {text: 'No'},
      ],
      {
        cancelable: true,
      },
    );
  };

  const profileDetails = () => {
    showAlert(
      `Profile Name:  ${currentUserFullName}
Login Name:  ${currentUserLoginId}
Email:  ${currentUserLoginId}`,
      'Profile Details',
    );
  };

  const inTheArray = user => {
    if (!contactsList[0]) {
      return false;
    } else {
      const dupUsers = contactsList[0].filter(ele => ele.login === user);
      if (dupUsers.length > 0) {
        return true;
      } else {
        return false;
      }
    }
  };

  const findContact = async searchedLoginName => {
    if (!checkValidLoginName()) {
      showAlert('Enter a valid Login Name', 'Invalid Input');
    } else if (inTheArray(searchedLoginName)) {
      showAlert('This user already exixts in the group.', 'Duplicate');
    } else {
      console.log(contactsList, 'list');
      console.log(contactsList.length, 'lennn');
      if (contactsList.length >= 3) {
        showAlert('Max 4 Users are allowed(Incl You).', 'Limit reached');
      } else {
        setContactLoading(true);
        const searchedUser = await CallService.getUserByLogin(
          searchedLoginName,
          currentUserLoginId,
        ).catch();
        console.log(searchedUser, 'bale');
        console.log(searchedUser.length, 'bool');
        console.log(searchedUser[0], 'bool');
        console.log(searchedUser == [], 'bool');
        console.log(searchedUser === [], 'bool');
        await setContactsList(
          !searchedUser.length
            ? [...contactsList]
            : [...contactsList, searchedUser],
        );
        console.log(contactsList, 'kdksdksd');
        setSearchValue('');
        setContactLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {currentUserFullName && (
        <View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
            <Image
              style={styles.logoutIcon}
              source={require('../../../assets/logout.png')}
            />
          </TouchableOpacity>
          <Text style={styles.name}>
            {'Welcome\n' +
              (currentUserFullName.length > 15
                ? currentUserFullName.slice(0, 15) + '...'
                : currentUserFullName)}
          </Text>
          <TouchableOpacity
            onPress={() => profileDetails()}
            style={styles.moreDetails}>
            <Text style={styles.moreDetails}>{'Profile\nDetails'}</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.descriptionText}>
        Find any friend with his Login Name
      </Text>
      <View style={styles.description}>
        <TextInput
          style={styles.searchInput}
          autoCapitalize="none"
          placeholder="Login name"
          returnKeyType="search"
          onChangeText={keyword => setSearchValue(keyword)}
          placeholderTextColor="grey"
          value={searchValue}
          maxLength={255}
        />
        <TouchableOpacity
          style={styles.searchButton(
            checkValidLoginName() ? '#177987' : 'grey',
          )}
          onPress={() => findContact(searchValue)}>
          <Text style={styles.searchText}>{'Search'}</Text>
        </TouchableOpacity>
      </View>

      {contactsList[0] && (
        <Text style={styles.title}>Select any friends for the Videocall</Text>
      )}
      {contactsList[0] ? (
        contactsList.map(ele => {
          // const user = CallService.getUserById(id);
          let user = ele[0];
          const selected = selectedUsersIds.some(
            userId => user && user.id === userId,
          );
          const type = selected
            ? 'radio-button-checked'
            : 'radio-button-unchecked';
          if (user) {
            user.color = user.color ? user.color : randomColor();
          }
          const onPress = selected ? unselectUser : selectUser;
          return (
            user && (
              <View>
                <TouchableOpacity
                  style={styles.userLabel(
                    user.color ? user.color : randomColor(),
                  )}
                  onPress={() => onPress(user.id)}>
                  <Text style={styles.userName}>
                    {user.full_name.length > 20
                      ? user.full_name.slice(0, 20) + '...'
                      : user.full_name}
                  </Text>
                  <MaterialIcon name={type} size={20} color="white" />
                </TouchableOpacity>
              </View>
            )
          );
        })
      ) : (
        <View />
      )}
      {/* {contactLoading && (
        <Text size="small" color="white">
          Loading...
        </Text>
      )} */}
      {contactLoading && <ActivityIndicator size="small" color="white" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFill,
    // justifyContent: 'center',
    backgroundColor: '#001a15',
    alignItems: 'center',
    marginTop: 25,
  },
  title: {
    fontSize: 20,
    color: '#1198d4',
    padding: 20,
    marginTop: 30,
  },
  name: {
    fontSize: 28,
    width: 235,
    fontWeight: '700',
    color: '#009378',
  },
  userLabel: backgroundColor => ({
    backgroundColor,
    width: 300,
    height: 50,
    borderRadius: 25,
    border: '1px solid red',
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5,
    paddingLeft: 25,
  }),
  searchButton: backgroundColor => ({
    backgroundColor,
    width: 200,
    height: 50,
    borderRadius: 25,
    border: '1px solid red',
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5,
    marginTop: 15,
    marginLeft: 50,
    paddingLeft: 65,
  }),
  searchText: {
    color: 'white',
    fontSize: 20,
  },
  userName: {
    color: 'white',
    fontSize: 20,
  },
  searchInput: {
    fontSize: 18,
    color: 'white',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: '#177987',
  },
  description: {
    width: SIZE_SCREEN.width - 110,
  },
  descriptionText: {
    paddingVertical: 5,
    color: '#177987',
    fontSize: 15,
    marginTop: 25,
  },
  moreDetails: {
    color: '#177987',
    fontWeight: '700',
    borderColor: '#177987',
    borderWidth: 3,
    borderRadius: 50,
    fontSize: 13,
    height: 60,
    width: 60,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZE_SCREEN.width - 165,
    marginTop: 10,
    paddingTop: 12,
    paddingLeft: 10,
  },
  logoutIcon: {
    position: 'absolute',
    height: 50,
    width: 50,
    opacity: 0.8,
  },
  logoutBtn: {
    position: 'absolute',
    height: 50,
    width: 50,
    marginLeft: -75,
    marginTop: 15,
    // backgroundColor: 'red',
  },
});
