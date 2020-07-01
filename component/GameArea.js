import React from 'react';
import { StyleSheet, Text, View, TextInput, Button,Dimensions,TouchableOpacity } from 'react-native';
import {Firebase} from '../context/Firebase';
import {LoginContext} from '../context/LoginContext';
import {GameConsole} from './GamesConsole';
import 'firebase/functions';

export const GameArea =()=>{
   
    const {getUser} = React.useContext(LoginContext);
    const [gameObj,setGameObj] = React.useState({});
    const [gameWait,setGameWait] = React.useState(true);
    const [user,setUser] = React.useState({});
    const [joinedUsers,setJoinedUsers] = React.useState([]);

    const startGame = () =>{
        Firebase.functions().httpsCallable('startRoom')({gameKey : gameObj.id}).then(function(resp){
            console.log(resp.data)
        }).catch((resp) =>{
            console.log(resp)
        })
    }

    React.useEffect(()=>{
        let user = getUser();
        setUser(user);
        Firebase.database().ref('users/'+user.id).once('value').then((snapshot)=>{
            let gameKey = snapshot.val().game;
            Firebase.database().ref('GameCodes/'+gameKey).once('value').then((gameShot)=>{
                setGameObj(gameShot.val());
            })
            Firebase.database().ref('GameCodes/'+gameKey+'/users').on('value',(snapshot) =>{
                setJoinedUsers(Object.values(snapshot.val()));
            })
            Firebase.database().ref('GameCodes/'+gameKey+'/status').on('value',(snapshot) =>{
                var sat = snapshot.val();
                console.log(snapshot.val());
                if(sat == 1){
                    setGameWait(false);
                }else{
                    setGameWait(true);
                }
            })
        });
    },[])
    return(
        <View style={{flex:1,backgroundColor : 'black'}}>
            {
                gameWait
                ?
                    <View style={{flex:1,backgroundColor : 'black'}}>
                        <View style={{height:100}}></View>
                        <Text style={{color : 'white'}}>{gameObj.code}</Text>
                        <Text style={{color : 'white'}}>{gameObj.name}</Text>
                        {
                            gameObj.owner == user.id && <TouchableOpacity onPress={() =>{startGame()}}><Text style={{color : 'white'}}>Start</Text></TouchableOpacity>
                        }
                        <View style={{height : 30}}></View>
                        <Text style={{color : 'white'}}>Users</Text>
                        {
                            joinedUsers.map((item,index) =>{
                                return (
                                    <Text key={index} style={{color : 'white'}}>{item}</Text>
                                )
                            })
                        }
                    </View>
                :
                    <GameConsole></GameConsole>
            }
        </View>
       
    )
}