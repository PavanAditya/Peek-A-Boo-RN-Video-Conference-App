import React, {Component} from 'react';
import Navigator from './src/helpers/navigator';
import {AuthService} from './src/services';

console.disableYellowBox = true;

export default class App extends Component {
  constructor(props) {
    super(props);

    AuthService.init();
  }
  render = () => <Navigator />;
}
