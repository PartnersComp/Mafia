import React from 'react';
import { Text, View,TouchableOpacity } from 'react-native';
import {Firebase} from '../context/Firebase';
import {LoginContext} from '../context/LoginContext';

export const MultipleVote =(props)=>{
    const [users,setUsers] = React.useState([]);
    const [selectedUsers,setSelectedUsers] = React.useState("");
    const [count,setCount] = React.useState({});
    const {getUser} = React.useContext(LoginContext);
    const setVote = (id) =>{
        Firebase.functions().httpsCallable('vote')({gameKey : props.gameKey,id : id,votePlace : props.place == 'vh' ? 'village' : 'sniper', user : getUser()}).then(function(resp){
            setSelectedUsers(id);
        }).catch((resp) =>{
            // console.log(resp)
        })
    }
    React.useEffect(()=>{
        Firebase.database().ref('GameCodes/'+props.gameKey+'/roles').once('value').then((gameShot)=>{
            var usersArray = gameShot.val() ? Object.values(gameShot.val()) : [];
            setUsers(usersArray);
        });
        Firebase.database().ref('GameCodes/'+props.gameKey+'/'+(props.place == 'vh' ? 'village' : 'sniper')).on('value',(gameShot)=>{
            var counting = gameShot.val() ? gameShot.val() : [];
            setCount(counting);
            console.log(counting)
        });
        Firebase.functions().httpsCallable('getVote')({gameKey : props.gameKey,votePlace : props.place == 'vh' ? 'village' : 'sniper', user : getUser()}).then(function(resp){
            setSelectedUsers(resp.data.id)
        }).catch((resp) =>{
            // console.log(resp)
        })
    },[]);
    return (
        <View>
             <Text>{props.place == 'hp' ? 'Hospital' : 'Police Station'}</Text>
              <View>
                {
                    users.map((item) =>{
                    return item.role != -1  && <View style={{flexDirection : 'row'}}><TouchableOpacity onPress={()=> setVote(item.id)}><Text style={item.id === selectedUsers ? {color : 'blue'} : {}}>{item.name}</Text></TouchableOpacity><View style={{flexGrow:1}}></View><Text style={{justifyContent:'flex-end'}}>{count[item.id] ? count[item.id].count : '0'}</Text></View>
                    })
                }
              </View>
        </View>
    )
}
// (props.place == 'vh' ||  item.role != 1)