import React from 'react';
import { StyleSheet, Text, View, TextInput, Button,Dimensions,TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements'
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {LoginContext} from './context/LoginContext';
import {Firebase} from './context/Firebase';
import 'firebase/functions';
import {GameArea} from './component/GameArea'
// import functions from '@react-native-firebase/functions';



const Login = ({navigation}) =>{
  const [name,setName] = React.useState("");
  const {getUser} = React.useContext(LoginContext);
  const {setUser} = React.useContext(LoginContext);
  
  const naviagteTo = () =>{
    let user = getUser();
    user.name = name;
    setUser(user);
    Firebase.database().ref('users/'+user.id).set({name : name});
    navigation.navigate('Room',{name,id : user.id})
  }
  React.useEffect(function(){
    let user = getUser();
    setName(user.name);
  },[])  

  return(
    <View style={styles.container}>
      <Text style={{color : 'white'}}>Enter you nickname to enter the world of mafias and villagers</Text>
      <View style={{height : 40}}></View>
      <TextInput style={{color : 'white', height: 30, width :Dimensions.get('window').width - 150,borderColor: 'white', borderBottomWidth: 1 }}value={name} textAlign="center" onChangeText={(text)=>{setName(text)}}></TextInput>
      <Button title="Continue" onPress={() =>naviagteTo()}></Button>
    </View>
  )
}

const Room = ({route,navigation}) =>{
  const [overLay,setOverLay] = React.useState({visible : false,type : 'join'});
  const [code,setCode] = React.useState("");
  const [roomName,setRoomName] = React.useState(route.params.name+"'s Room");
  const {setGame} = React.useContext(LoginContext);
  const joinRoom = () =>{
    Firebase.functions().httpsCallable('joinRoom')({code : code,userId : route.params.id,userName : route.params.name}).then(function(resp){
      console.log(resp.data)
      if(resp.data.status == -1){
        console.log('Invalid')
      }else{
        setGame();
      }
    }).catch((resp) =>{
      console.log(resp)
    })
  }

  const createRoom = () =>{
    var a = Math.floor(100000 + Math.random() * 900000)
    let obj={}
    obj[route.params.id] = route.params.name;
    var s=Firebase.database().ref('GameCodes/').push({name : roomName,code : a,owner : route.params.id,users : obj,status:-1,time : 2})
    s.update({id : s.key});
    let codeObj={};
    codeObj[s.key] = a;
    Firebase.database().ref('Codes/').update(codeObj);
    Firebase.database().ref('users/'+route.params.id).update({game : s.key});
    setGame();
  }
  return(
    <View style={styles.container}>
      <TouchableOpacity><Text style={styles.touchableButton} onPress={() => setOverLay({visible : true,type : 'create'})}>Create</Text></TouchableOpacity>
      <View style={{height : 20}}></View>
      <TouchableOpacity><Text style={styles.touchableButton} onPress={() => setOverLay({visible : true,type : 'join'})}>Join</Text></TouchableOpacity>
      <Overlay isVisible={overLay.visible} onBackdropPress={() => setOverLay({visible : false,type : overLay.type})}>
          {
            overLay.type == 'join'
            ?
            <View style={{felx : 1,justifyContent : 'center',alignItems :'center'}}>
              <TextInput style={{color : 'black', height: 30, width :Dimensions.get('window').width - 150,borderColor: 'black', borderBottomWidth: 1 }}value={code} textAlign="center" placeholder="Enter the code" onChangeText={(text)=>{setCode(text)}}></TextInput>
              <TouchableOpacity style={{paddingTop : 30,paddingBottom : 10}} onPress={() =>joinRoom()}><Text>Join</Text></TouchableOpacity>
            </View>
            :
            <View  style={{felx : 1,justifyContent : 'center',alignItems :'center'}}>
              <TextInput style={{color : 'black', height: 30, width :Dimensions.get('window').width - 150,borderColor: 'black', borderBottomWidth: 1 }}value={roomName} textAlign="center" placeholder="Enter the Room Name" onChangeText={(text)=>{setRoomName(text)}}></TextInput>
              <TouchableOpacity style={{paddingTop : 30,paddingBottom : 10}} onPress={() =>createRoom()}><Text>Create</Text></TouchableOpacity>
            </View>
          } 
          
        </Overlay>
    </View>
  )
}

export default function App() {
  
  const [userToken,setUserToken] = React.useState("");
  const [gameToken,setGameToken] = React.useState("");
  const [user,setUser] = React.useState("");
  const loginContext = {
    signUp: () => {
      setGameToken(true);
    },
    signOut: () => {
      setUserToken(false);
    },
    getUser : () => {
      return user;
    },
    setUser : (val) =>{
      setUser(val);
    },
    setGame : () =>{
      setGameToken(true);
    },
    exitGame : () =>{
      setGameToken(false);
    }
  };

  React.useEffect(() =>{
    Firebase.auth().signInAnonymously();
    Firebase.auth().onAuthStateChanged((userToken) =>{
      var user={id : userToken.uid};
      Firebase.database().ref('users/'+user.id).once('value').then((snapshot)=>{
        user.name = snapshot.val() && snapshot.val().name ? snapshot.val().name : "";
        setUser(user);
        setUserToken(true);
      });
    });
    
  },[])

  const EntryStack = createStackNavigator();
  return (
    <LoginContext.Provider value={loginContext}>
      { userToken 
        ?
          gameToken
          ?
            <GameArea></GameArea>
          :
          <NavigationContainer>
            <EntryStack.Navigator screenOptions={{headerStyle: { backgroundColor: 'black'},headerTitleStyle: {fontWeight: 'bold',color : 'white'}}}>
              <EntryStack.Screen name="Login" component={Login} options={{title : ""}}></EntryStack.Screen>
              <EntryStack.Screen name="Room" component={Room} options={{title : "Join/Create"}}></EntryStack.Screen>
            </EntryStack.Navigator>
          </NavigationContainer>
        :
          <Text>SomeLoading</Text>
      }
    </LoginContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchableButton : {
    color : 'white',
    paddingLeft:30,
    paddingRight:30,
    paddingTop : 10,
    paddingBottom:10,
    alignItems: 'center',
    backgroundColor : 'red',
    fontWeight :'bold',
    fontSize : 20
  }
});
