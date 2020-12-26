import React from 'react';
import { Text, View,TextInput, TouchableOpacity } from 'react-native';
import {Firebase} from '../context/Firebase';

export const NoticeBoard =(props)=>{

    const [message,setMessage] = React.useState([]);
    React.useEffect(()=>{
        Firebase.database().ref('GameCodes/'+props.gameKey+'/notice').on('value',(gameShot)=>{
            var messageArray = gameShot.val() ? Object.values(gameShot.val()) : [];
            setMessage(messageArray);
        });
    },[]);
    return (
        <View>
             <Text>Notice Board</Text>
              <View>
                {
                    message.map((item) =>{
                    return <Text>{item}</Text>
                    })
                }
              </View>
        </View>
    )
}