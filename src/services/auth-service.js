import ConnectyCube from 'react-native-connectycube';
import config from '../helpers/config';
import AsyncStorage from '@react-native-community/async-storage';

export default class AuthService {
  static CURRENT_USER_SESSION_KEY = 'CURRENT_USER_SESSION_KEY';
  static DEVICE_TOKEN_KEY = 'DEVICE_TOKEN_KEY';

  init = () => ConnectyCube.init(...config);

  async setUserSession(userSession) {
    return AsyncStorage.setItem(
      AuthService.CURRENT_USER_SESSION_KEY,
      JSON.stringify(userSession),
    );
  }

  async getUserSession() {
    return await AsyncStorage.getItem(AuthService.CURRENT_USER_SESSION_KEY);
  }

  async setStoreToken(userSession) {
    const authToken = userSession.token;
    return await AsyncStorage.setItem(AuthService.DEVICE_TOKEN_KEY, authToken);
  }

  async getStoreToken() {
    return await AsyncStorage.getItem(AuthService.DEVICE_TOKEN_KEY);
  }

  login = user => {
    return new Promise(async (resolve, reject) => {
      const session = await ConnectyCube.createSession(user).catch(err =>
        reject(err),
      );
      this.setStoreToken(session);
      this.setUserSession(session);
      ConnectyCube.createSession(user)
        .then(async () => {
          console.log(session.user.id, 'kjsadkjsjsd');
          await ConnectyCube.chat.connect({
            userId: session.user.id,
            password: user.password,
          });
        })
        .then(resolve(session))
        .catch(err => reject(err));
    });
  };

  register = async user => {
    const session = await ConnectyCube.createSession();
    await ConnectyCube.users.signup(user);
    return new Promise(async (resolve, reject) => {
      ConnectyCube.createSession(user)
        .then(() => {
          console.log(session.user.id, 'kjsadkjsjsd');
          ConnectyCube.chat.connect({
            userId: session.user.id,
            password: user.password,
          });
        })
        .then(resolve(session))
        .catch(reject);
    });
  };

  logout = () => {
    ConnectyCube.chat.disconnect();
    ConnectyCube.destroySession();
  };
}
