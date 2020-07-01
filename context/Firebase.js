import * as firebase from 'firebase';

let config = {
    apiKey: "AIzaSyBibUAg6hlL49S38wk6yYFZTR_d1LDrycs",
    authDomain: "mafia-5c4a0.firebaseapp.com",
    databaseURL: "https://mafia-5c4a0.firebaseio.com",
    projectId: "mafia-5c4a0",
    storageBucket: "mafia-5c4a0.appspot.com",
    messagingSenderId: "75099838960",
    appId: "1:75099838960:web:b97af006d4b0b57c632535",
    measurementId: "G-YY9M26PK72"
};
if(!firebase.apps.length){
  firebase.initializeApp(config);
}

export const Firebase = firebase;