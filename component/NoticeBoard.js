import React from 'react';
import { Text, View,TextInput, TouchableOpacity } from 'react-native';
import {Firebase} from '../context/Firebase';
import {LoginContext} from '../context/LoginContext';

export const NoticeBoard =(props)=>{

    const [message,setMessage] = React.useState([]);
    const [typeMessage,setTypeMessage] = React.useState("");
    const {getUser} = React.useContext(LoginContext);
    const sendMessage = () =>{
        var user = getUser(); 
        Firebase.database().ref('GameCodes/'+props.gameKey+'/'+ (props.place == 'th' ? 'townMessage' : 'mafiaMansion')).push({message : typeMessage, user : {id : user.id,name : user.name}});
        setTypeMessage("");
    }
    React.useEffect(()=>{
        Firebase.database().ref('GameCodes/'+props.gameKey+'/'+(props.place == 'th' ? 'townMessage' : 'mafiaMansion')).on('value',(gameShot)=>{
            var messageArray = gameShot.val() ? Object.values(gameShot.val()) : [];
            setMessage(messageArray);
        });
    },[]);
    return (
        <View>
             <Text>{props.place == 'th' ? 'Town Hall' : 'Mafia Mansion'}</Text>
              <View>
                {
                    message.map((item) =>{
                    return <Text>{item.user.name} : {item.message}</Text>
                    })
                }
                <TextInput style={{color : 'black', height: 30, width : 150,borderColor: 'black', borderBottomWidth: 1 }}value={typeMessage}  onChangeText={(text)=>{setTypeMessage(text)}}></TextInput>
                <TouchableOpacity onPress={()=>sendMessage()}><Text>Send</Text></TouchableOpacity>
              </View>
        </View>
    )
}