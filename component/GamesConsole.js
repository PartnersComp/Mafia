import React from 'react';
import { StyleSheet, Text, View, TextInput, Button,Dimensions,TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements'
import {LoginContext} from '../context/LoginContext';
import {Firebase} from '../context/Firebase';

import {MessagePlace} from './MessagePlace';
import {MultipleVote} from './MultipleVote';
import {SingleVote} from './SingleVote';
import {NoticeBoard} from './NoticeBoard';

export const GameConsole =()=>{

    const [user,setUser] = React.useState({});
    const [userRole,setUserRole] = React.useState({});
    const {getUser} = React.useContext(LoginContext);
    const [gameObj,setGameObj] = React.useState({});
    const [windowStatus,setWindowStatus] = React.useState("");
    const [windowVisible,setWindowVisible] = React.useState(false);
    const [timer,setTimer] = React.useState("");
    const [dayType,setDayType] = React.useState("");
    const openWindow = (val) =>{
        setWindowVisible(true);
        setWindowStatus(val);
    }

    const renderWindow = ()=>{
        switch(windowStatus){
            case 'th':
                return <MessagePlace gameKey={gameObj.id} place="th" user={user}></MessagePlace>
            case 'mm':
                if(userRole.role != 1){
                    return <Text>Only Mafia can enter this house</Text>
                }else if(dayType != -1){
                    return <Text>Please come back during night</Text>
                }else{
                    return <MessagePlace gameKey={gameObj.id} place="mm" user={user}></MessagePlace>
                }
            case 'h':
                if(userRole.role != 3){
                    return <Text>Only Doctor can enter this house</Text>
                }else if(dayType != -1){
                    return <Text>Please come back during night</Text>
                }else{
                    return <SingleVote gameKey={gameObj.id} place="hp" user={user}></SingleVote>
                }
            case 'ps':
                if(userRole.role != 2){
                    return <Text>Only Detective can enter this house</Text>
                }else if(dayType != -1){
                    return <Text>Please come back during night</Text>
                }else{
                    return <SingleVote gameKey={gameObj.id} place="ps" user={user}></SingleVote>
                }
            case 'sr':
                if(userRole.role != 1){
                    return <Text>Only Mafia can enter this house</Text>
                }else if(dayType != -1){
                    return <Text>Please come back during night</Text>
                }else{
                    return <MultipleVote gameKey={gameObj.id} place="sr" user={user}></MultipleVote>
                }
            case 'vh':
                if(userRole.role == -1){
                    return <Text>Only alive can enter this place</Text>
                }else if(dayType != 1){
                    return <Text>This house is only available during the day</Text>
                }else{
                    return <MultipleVote gameKey={gameObj.id} place="vh" user={user}></MultipleVote>
                }
            case 'nt':
                return <NoticeBoard  gameKey={gameObj.id}></NoticeBoard>
        }
    }

    const getGameData = () =>{
        let user = getUser();
        setUser(user);
        Firebase.database().ref('users/'+user.id).once('value').then((snapshot)=>{
            let gameKey = snapshot.val().game;
            Firebase.database().ref('GameCodes/'+gameKey).once('value').then((gameShot)=>{
                var game = gameShot.val()
                setGameObj(game);
                setUserRole(game.roles[user.id]);
                Firebase.database().ref('GameCodes/'+gameKey+'/roles/'+user.id).on('value',(roleShot)=>{
                    let role = roleShot.val() ? roleShot.val() : {};
                    setUserRole(role);
                });
                Firebase.database().ref('GameCodes/'+gameKey+'/type').on('value',(typeShot)=>{
                    let type = typeShot.val() ? typeShot.val() : 0;
                    if(type != 0){
                        countDown(game.time);
                    }
                    setDayType(type);
                });
            });
            
        });
    }

    const countDown = (time) =>{
        var countDownDate = new Date().setMinutes(new Date().getMinutes()+parseInt(time));
        var x = setInterval(function() {
            var now = new Date().getTime();
            var distance = countDownDate - now;
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimer(minutes + ' : ' + seconds)
            if (distance < 0) {
                clearInterval(x);
            }
        }, 1000);
    }

    React.useEffect(()=>{
        getGameData();
    },[])
    return(
        <View>
            <View style={{height:100}}></View>
            <View> 
                <Text style={{color : 'white'}}> Your Current Role is : {userRole.roleName}</Text>
            </View>
            <View style={{height : 50}}></View>
            <TouchableOpacity onPress={() => openWindow('th')}><Text style={{color : 'white'}}>Town Hall</Text></TouchableOpacity>
            <View style={{height : 20}}></View>
            <TouchableOpacity onPress={() => openWindow('mm')}><Text style={{color : 'white'}}>Mafia Mansion</Text></TouchableOpacity>
            <View style={{height : 20}}></View>
            <TouchableOpacity onPress={() => openWindow('h')}><Text style={{color : 'white'}}>Hospital</Text></TouchableOpacity>
            <View style={{height : 20}}></View>
            <TouchableOpacity onPress={() => openWindow('ps')}><Text style={{color : 'white'}}>Police Station</Text></TouchableOpacity>
            <View style={{height : 20}}></View>
            <TouchableOpacity onPress={() => openWindow('sr')}><Text style={{color : 'white'}}>Sniper Range</Text></TouchableOpacity>
            <View style={{height : 20}}></View>
            <TouchableOpacity onPress={() => openWindow('vh')}><Text style={{color : 'white'}}>Village Hall</Text></TouchableOpacity>
            <View style={{height : 20}}></View>
            <TouchableOpacity onPress={() => openWindow('nt')}><Text style={{color : 'white'}}>Notice</Text></TouchableOpacity>
            <View style={{height : 20}}></View>
            <View style={{height : 20}}></View>
            {
                dayType == 0 ?
                    <Text style={{color : 'white'}}>Game Over</Text>
                : 
                    <View>
                        <Text style={{color : 'white'}}>Time : {timer}</Text>
                        <View style={{height : 20}}></View>
                        <Text style={{color : 'white'}}>Its {dayType == -1 ? 'Night' : 'Day'} time</Text>
                    </View>
            }
            
            <Overlay isVisible={windowVisible} onBackdropPress={() => setWindowVisible(false)}>
                {
                    renderWindow()
                }
            </Overlay>
        </View>
    )
}