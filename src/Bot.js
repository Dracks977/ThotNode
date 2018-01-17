module.exports = {JoinConv, SendMsg, Getconv};

var key = "GEMUJ4EU3W8.cwA.S2g.OfZf_Iao29a5Zk8ZVrX4TvrwGg7ttvV3viymSNIWCgg"


/**
* Get token and Conv id
*/
function JoinConv(request, callback){
    request({
        url: "https://directline.botframework.com/v3/directline/tokens/generate",
        headers: {
            'Authorization': "Bearer " +  key,
        },
        method: "POST",
        json: true
    }, function (error, response, body){
        if (!error){
            ConvG(request,body, function(err,res){
                if(!err)
                    callback(error,res);
            });
            
        } else
        callback(error);
    });
}

/**
* Need return of JoinConv and data (msg +room id)
* envoie un message au bot =)
*/
function SendMsg(request, oldbody, data, callback){

    var Sbody = {
        "type": "message",
        "from": {
            "id": data.room
        },
        "text": data.msg
    };

    request({
        url: "https://directline.botframework.com/v3/directline/conversations/" + oldbody.conversationId + "/activities",
        headers: {
            'Authorization': "Bearer " +  oldbody.token,
        },
        method: "POST",
        json: true,
        body : Sbody
    }, function (error, response, body){
        if (!error){
           
            callback(true);
        } else
        callback(false);
    });
}

/**
*
*/
function Getconv(request, oldbody, callback){
    request({
        url: "https://directline.botframework.com/v3/directline/conversations/"+ oldbody.conversationId +"/activities?watermark=",
        headers: {
            'Authorization': "Bearer " +  oldbody.token,
        },
        method: "GET",
        json: true
    }, function (error, response, body){
        if (!error){
            callback(error,body, oldbody);
        } else
        callback(error);
    });
}


/**
* utilitaire
*/
function ConvG(request, oldbody, callback){
    request({
        url: "https://directline.botframework.com/v3/directline/conversations",
        headers: {
            'Authorization': "Bearer " +  oldbody.token,
        },
        method: "POST",
        json: true
    }, function (error, response, body){
        if (!error){
            callback(error, body)
        } else
        callback(error);
    });
}





