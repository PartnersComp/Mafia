import React from 'react';
import { Text, View,TouchableOpacity} from 'react-native';
import {Firebase} from '../context/Firebase';

export const SingleVote =(props)=>{
    const [users,setUsers] = React.useState([]);
    const [selectedUsers,setSelectedUsers] = React.useState("");
    const setVote = (id) =>{
        var setObj={}
        setObj[props.place == 'hp' ? 'doctor' : 'police'] = id;
        Firebase.database().ref('GameCodes/'+props.gameKey).update(setObj);
    }
    React.useEffect(()=>{
        Firebase.database().ref('GameCodes/'+props.gameKey+'/roles').once('value').then((gameShot)=>{
            var usersArray = gameShot.val() ? Object.values(gameShot.val()) : [];
            setUsers(usersArray);
        });
        Firebase.database().ref('GameCodes/'+props.gameKey+'/'+ (props.place == 'hp' ? 'doctor' : 'police')).on('value',(gameShot)=>{
            var selectedUser = gameShot.val() ? gameShot.val() : "";
            setSelectedUsers(selectedUser)
        });
    },[]);
    return (
        <View>
             <Text>{props.place == 'hp' ? 'Hospital' : 'Police Station'}</Text>
              <View>
                {
                    users.map((item) =>{
                    return item.role != -1 && (props.place == 'hp' ||  item.role != 2) && <TouchableOpacity onPress={()=> setVote(item.id)}><Text style={item.id === selectedUsers ? {color : 'blue'} : {}}>{item.name}</Text></TouchableOpacity>
                    })
                }
              </View>
        </View>
    )
}

  