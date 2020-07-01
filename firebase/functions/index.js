const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.joinRoom = functions.https.onRequest(async (req, res) => {
    return admin.database().ref('Codes/').once('value',(snapshot)=>{
        var code = Object.values(snapshot.val());
        var userCode = parseInt(req.body.data.code);
        
        if(code.indexOf(userCode) === -1){
            res.send({data : {status : -1,message : 'Invalid Room Code'}});
        }else{
            var userId = req.body.data.userId;
            var userName =  req.body.data.userName;
            var gameKey = Object.keys(snapshot.val()).filter((item)=>{return snapshot.val()[item] === userCode})[0];
            admin.database().ref('users/'+userId).update({game : gameKey});
            var userObj = {};
            userObj[userId] = userName;
            admin.database().ref('GameCodes/'+gameKey+'/users/').update(userObj)
            res.send({data : {status : 1,message : 'Sucess'}});
        }
        
    });
});

exports.startRoom = functions.https.onRequest(async (req,res) =>{
    let game = await admin.database().ref('GameCodes/'+req.body.data.gameKey).once('value');
    game = game.val();
    let usersArray = Object.keys(game.users);


    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    shuffleArray(usersArray);
    let role={};
    let copCount = 1,doctorCount =1;
    let totalCount = usersArray.length;
    let mafiaCount = parseInt((totalCount - 2)/2);
    let villageCount = totalCount - (mafiaCount+copCount+doctorCount);
    for(let i=0;i<totalCount;i++){
        if(doctorCount !== 0){
            role[usersArray[i]] = {name : game.users[usersArray[i]], role :3,roleName : 'Doctor'}
            doctorCount--;
        }else if(copCount !== 0){
            role[usersArray[i]] = {name : game.users[usersArray[i]], role :2,roleName : 'Detective'}
            copCount--;
        }else if(mafiaCount !==0){
            role[usersArray[i]] = {name : game.users[usersArray[i]], role :1,roleName : 'Mafia'}
            mafiaCount--;
        }else if(villageCount !==0){
            role[usersArray[i]] = {name : game.users[usersArray[i]], role :0,roleName : 'Villagers'}
            villageCount--;
        }
    }
    await admin.database().ref('GameCodes/'+req.body.data.gameKey+'/roles').set(role);
    await admin.database().ref('GameCodes/'+req.body.data.gameKey).update({status : 1});
    res.send({data : {status : game,message : 'Sucess'}});
})
