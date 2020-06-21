import {Alert} from 'react-native';

export function showAlert(
  message,
  title = '',
  buttons = ['OK', ''],
  cancelable = false,
) {
  Alert.alert(
    title,
    message,
    buttons[1] !== ''
      ? [{text: buttons[0]}, {text: buttons[1]}]
      : [{text: buttons[0]}],
    {
      cancelable,
    },
  );
}
