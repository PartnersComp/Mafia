import React from 'react';
import { StyleSheet, Text, View, Image,TouchableOpacity } from 'react-native';
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
            // console.log(resp.data)
        }).catch((resp) =>{
            // console.log(resp)
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
                // console.log(snapshot.val());
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
                        <View style={{height : 20}}></View>
                        <View style={styles.container}>
                            <Image style={{width : 75,height : 75}} resizeMode="contain"source={require('../assets/white_mafia.png')}/>
                        </View>
                        <View style={{height : 20}}></View>
                        <View style={{flexDirection : 'row'}}>
                        <Text style={styles.headTextStyle}>Code : </Text><Text style={styles.textStyle}>{gameObj.code}</Text>
                        </View>
                        <View style={{flexDirection : 'row'}}>
                        <Text style={styles.headTextStyle}>Name : </Text><Text style={styles.textStyle}>{gameObj.name}</Text>
                        </View>
                        <View style={{height : 20}}></View>
                        {
                            gameObj.owner == user.id && <TouchableOpacity onPress={() =>{startGame()}}><Text style={styles.headTextStyle}>Start</Text></TouchableOpacity>
                        }
                        <View style={{height : 30}}></View>
                        <Text style={styles.headTextStyle}>Users : {joinedUsers.length}</Text>
                        {
                            joinedUsers.map((item,index) =>{
                                return (
                                    <Text key={index} style={[styles.textStyle,{paddingLeft : 10}]}>{item}</Text>
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


const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headTextStyle : {
      fontWeight :'bold',
      fontSize : 20,
      color : 'white'
    },
    textStyle : {
        fontSize : 20,
        color : 'white'
    }
});