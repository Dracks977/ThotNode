module.exports = function(socket, db,hasher){

   var users = db.collection('users');

 /*
   * data.token = id user data.friends = adresse mail de l'ami
   * si false l'ami n'existe pas dans la bdd
   */
   socket.on("AddFriend", function(data){
    var rep = new Object();
    rep.status = false;
    console.dir("add friend : ");
    console.dir(data);
    users.findOne({mail:data.mail}, function(err, res){
      if (res){
        console.log("friend found")
        console.log(res)
         rep.status = true;
         users.update({_id:ObjectId(data.token)},{ $push: { friends: res.mail } });
      }
      socket.emit("AddFriend", rep);
    })

  })

  /*
   * data = token user
   */
   socket.on("GetFriend", function(data){
     var rep = new Object();
    rep.status = false;
    users.findOne({_id:ObjectId(data)}, function(err, res){
      if(res){
         rep.friends = res.friends
         rep.status = true;
         socket.emit("GetFriend", rep);
      }
    })
  })

  
}