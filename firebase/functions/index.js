const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const resetVoting = async (place,gameKey) =>{
    let role =  await admin.database().ref('GameCodes/'+gameKey+'/roles').once('value');
    role = role.val() ? Object.values(role.val()) : [];

    let voteObj={};

    class VoteRole {
        constructor() {
            this.count = 0;
            this.voters = JSON.stringify(new Array());
        }
    }

    for(let i=0;i<role.length;i++){
        if(place === 'sniper'){
            if(role[i].role !== -1 || role[i].role !== 1){
                voteObj[role[i].id] = new VoteRole();
            }
        }else{
            if(role[i].role !== -1){
                voteObj[role[i].id] = new VoteRole();
            }
        }
    }
    console.log(voteObj)
    await admin.database().ref('GameCodes/'+gameKey+'/'+place).set(voteObj);
}



class Game{
    constructor(key,time){
        this.gameKey = key;
        this.countDownTime = time;
        this.timer();
    }
    timer(){
        var countDownDate = new Date().setMinutes(new Date().getMinutes()+this.countDownTime);
        var x = setInterval(function() {
            var now = new Date().getTime();
            var distance = countDownDate - now;
            if (distance < 0) {
                clearInterval(x);
                this.changeDayNight();
            }
        }.bind(this), 10);
    }
    async changeDayNight(){
        let game = await admin.database().ref('GameCodes/'+this.gameKey).once('value');
        game = game.val();

        let type = game.type;

        if(type === -1){
            let police = game.police;
            if(police){
                if(game.roles[police].role === 1){
                    var role = new Role(game.roles[police].name,-1,'Dead',game.roles[police].id);
                    admin.database().ref('GameCodes/'+this.gameKey+'/roles/'+role.id).set(role);
                    admin.database().ref('GameCodes/'+this.gameKey+'/notice').push("Mafia "+role.name+' was killed by the cop');
                }
            }
            let sniperArray = game.sniper;
            let count = 0;
            let id="";
            for(let i in sniperArray){
                if(sniperArray[i].count > count){
                    count = sniperArray[i].count;
                    id = i;
                }
            }
            if(id !== null && id !== ""){
                if(!game.doctor || (game.doctor && game.doctor !== id)){ 
                    let rolem = new Role(game.roles[id].name,-1,'Dead',game.roles[id].id);
                    await admin.database().ref('GameCodes/'+this.gameKey+'/roles/'+rolem.id).set(rolem);
                    admin.database().ref('GameCodes/'+this.gameKey+'/notice').push("Villager "+rolem.name+' was killed by the Mafia');
                }else{
                    admin.database().ref('GameCodes/'+this.gameKey+'/notice').push("Villager was saved by the Doctor");
                }
            }
            await resetVoting('sniper',this.gameKey);
        }else{
            let villageArray = game.village;
            let count = 0;
            let id="";
            for(let i in villageArray){
                if(villageArray[i].count > count){
                    count = villageArray[i].count;
                    id = i;
                }
            }
            if(id !== null && id !== ""){
                let rolei = new Role(game.roles[id].name,-1,'Dead',game.roles[id].id);
                await admin.database().ref('GameCodes/'+this.gameKey+'/roles/'+rolei.id).set(rolei);
                admin.database().ref('GameCodes/'+this.gameKey+'/notice').push(rolei.name+' was killed by the Villagers');
            }
            await resetVoting('village',this.gameKey);
        }
        let check = await this.checkGameEnd();
        if(check){
            await admin.database().ref('GameCodes/'+this.gameKey).update({type : type === -1 ? 1 : -1});
            this.timer();
        } 
    }
    async checkGameEnd(){
        let game = await admin.database().ref('GameCodes/'+this.gameKey+'/roles').once('value');
        game = game.val() ? Object.values(game.val()) : [];
        let mafiaCount=0,villagerCount=0;
        for(let i=0;i<game.length;i++){
            if(game[i].role === 1){
                mafiaCount++
            }else if(game[i].role !== -1){
                villagerCount++
            }
        }
        if(villagerCount === mafiaCount || villagerCount === 0){
            admin.database().ref('GameCodes/'+this.gameKey+'/notice').push("Mafia Wins");
            admin.database().ref('GameCodes/'+this.gameKey).update({type : 0});
            return false
        }else if(villagerCount/3 > mafiaCount || mafiaCount === 0){
            admin.database().ref('GameCodes/'+this.gameKey+'/notice').push("Villagers Wins");
            admin.database().ref('GameCodes/'+this.gameKey).update({type : 0});
            return false
        }
        return true;
    }
}

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

class Role {
    constructor(name,role,rolename,id) {
        this.name = name;
        this.role = role;
        this.roleName = rolename;
        this.id = id;
    }
}

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
    let villageCount = parseInt((totalCount - 2)/2);
    let mafiaCount = totalCount - (villageCount+copCount+doctorCount);

    for(let i=0;i<totalCount;i++){
        if(doctorCount !== 0){
            role[usersArray[i]] = new Role(game.users[usersArray[i]],3,'Doctor',usersArray[i]);
            doctorCount--;
        }else if(copCount !== 0){
            role[usersArray[i]] = new Role(game.users[usersArray[i]],2,'Detective',usersArray[i]);
            copCount--;
        }else if(mafiaCount !==0){
            role[usersArray[i]] = new Role(game.users[usersArray[i]],1,'Mafia',usersArray[i]);
            mafiaCount--;
        }else if(villageCount !==0){
            role[usersArray[i]] = new Role(game.users[usersArray[i]],0,'Villagers',usersArray[i]);
            villageCount--;
        }
    }
    await admin.database().ref('GameCodes/'+req.body.data.gameKey+'/roles').set(role);
    await admin.database().ref('GameCodes/'+req.body.data.gameKey+'/type').set(-1);
    await admin.database().ref('GameCodes/'+req.body.data.gameKey).update({status : 1});
    await resetVoting('sniper',req.body.data.gameKey);
    await resetVoting('village',req.body.data.gameKey);
    new Game(req.body.data.gameKey,game.time);
    res.send({data : {status : game,message : 'Sucess'}});
});

exports.vote = functions.https.onRequest(async (req,res) =>{
    let vote = await admin.database().ref('GameCodes/'+req.body.data.gameKey+'/'+req.body.data.votePlace).once('value');
    vote = vote.val();

    let voteId = req.body.data.id;
    let userId = req.body.data.user.id;

    for(let i in vote){
        let m = JSON.parse(vote[i].voters)
        let l = m.indexOf(userId);
        if(l>=0){
            m.splice(l,1)
            vote[i].count = m.length;
            vote[i].voters = JSON.stringify(m);
            break;
        }
    }

    let voteObj = vote[voteId];
    let voteArr = JSON.parse(voteObj.voters);
    if(voteArr.indexOf(userId) < 0){
        voteObj.count = voteObj.count + 1;
        voteArr.push(userId);
    }
    voteObj.voters = JSON.stringify(voteArr);

    console.log(vote);
    

    await admin.database().ref('GameCodes/'+req.body.data.gameKey+'/'+req.body.data.votePlace).set(vote);
    res.send({data : {message : 'Sucess'}});
});

exports.getVote = functions.https.onRequest(async (req,res) =>{
    let vote = await admin.database().ref('GameCodes/'+req.body.data.gameKey+'/'+req.body.data.votePlace).once('value');
    vote = vote.val();

    let userId = req.body.data.user.id;

    let id;

    for(let i in vote){
        let m = JSON.parse(vote[i].voters)
        let l = m.indexOf(userId);
        if(l>=0){
            id=i;
            break;
        }
    }
    res.send({data : {id : id,message : 'Sucess'}});
});