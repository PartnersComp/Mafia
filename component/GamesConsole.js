import React from 'react';
import { StyleSheet, Text, View, TextInput, Button,Dimensions,TouchableOpacity } from 'react-native';
import { Overlay } from 'react-native-elements'
import {LoginContext} from '../context/LoginContext';
import {Firebase} from '../context/Firebase';

import {TownHall} from './TownHall';
import {VillageHouse} from './VillageHouse';
import {SniperRange} from './SniperRange';
import {PoliceStation} from './PoliceStation';
import {Hospital} from './Hospital';
import {MafiaMansion} from './MafiaMansion';

export const GameConsole =()=>{

    const [user,setUser] = React.useState({});
    const [userRole,setUserRole] = React.useState({});
    const {getUser} = React.useContext(LoginContext);
    const [gameObj,setGameObj] = React.useState({});
    const [windowStatus,setWindowStatus] = React.useState("");
    const [windowVisible,setWindowVisible] = React.useState(false);
    const openWindow = (val) =>{
        setWindowVisible(true);
        setWindowStatus(val);
    }

    const renderWindow = ()=>{
        switch(windowStatus){
            case 'th':
                return <TownHall gameKey={gameObj.id}></TownHall>
            case 'mm':
                if(userRole.role != 1){
                    return <Text>Only Mafia can enter this house</Text>
                }else{
                    return <MafiaMansion></MafiaMansion>
                }
            case 'h':
                if(userRole.role != 3){
                    return <Text>Only Doctor can enter this house</Text>
                }else{
                    return <Hospital></Hospital>
                }
            case 'ps':
                if(userRole.role != 2){
                    return <Text>Only Detective can enter this house</Text>
                }else{
                    return <PoliceStation></PoliceStation>
                }
            case 'sr':
                if(userRole.role != 1){
                    return <Text>Only Mafia can enter this house</Text>
                }else{
                    return <SniperRange></SniperRange>
                }
            case 'vh':
                if(userRole.role != 1){
                    return <Text>This house is available during the day</Text>
                }else{
                    return <VillageHouse></VillageHouse>
                }
        }
    }

    React.useEffect(()=>{
        let user = getUser();
        setUser(user);
        Firebase.database().ref('users/'+user.id).once('value').then((snapshot)=>{
            let gameKey = snapshot.val().game;
            console.log(gameKey);
            Firebase.database().ref('GameCodes/'+gameKey).once('value').then((gameShot)=>{
                var game = gameShot.val()
                console.log(gameShot.val());
                setGameObj(game);
                setUserRole(game.roles[user.id]);
                console.log(userRole);
                console.log(gameObj);
            });
        });
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
            <Overlay isVisible={windowVisible} onBackdropPress={() => setWindowVisible(false)}>
                {
                    renderWindow()
                }
            </Overlay>
        </View>
    )
}