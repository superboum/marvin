//REQUIRE
var Twit = require('twit')
var slackAPI = require('slackbotapi');
var config = require('./config.json');
var matrix = require("matrix-js-sdk");

//API CONF

var T = new Twit(config.twitter.auth);

var seen = [];

var stream = T.stream('statuses/filter', {follow: config.twitter.follow, track: config.twitter.track });

if (config.slack) {
  var slack = new slackAPI(config.slack.auth);
  var send = function(msg) {
    slack.sendMsg(config.slack.channel, msg);
  };

  slack.on('message', function(msg) {
    console.log("Slack message: "+msg.text);
  });

  slack.on('hello', function() {
    console.log('Connected to Slack');
    //console.log(slack.slackData.channels);
    stream.on('tweet', function (tweet) {
      console.log(tweet.text);
      send("Nouveau tweet de "+tweet.user.name+" ("+tweet.user.screen_name+")\n"+tweet.text);
    });
  });
}

if (config.matrix) {
  var client = matrix.createClient(config.matrix.auth);
  roomsId = []
  client.setDisplayName("marvin");

  // Load roomsID
  config.matrix.room.reduce((acc, room) => {
    return acc.then(() => {
      return new Promise(cb => {
        client.getRoomIdForAlias(room).done((res) => {
          roomsId.push(res.room_id);
          cb();
        });
      });
    });
  }, Promise.resolve()).then(() => {
    roomsId.forEach(roomId => {
      client.joinRoom(roomId).done(() => {
        client.sendTextMessage(roomId, "hello, i'm marvin");
      });
    });

    stream.on('tweet', tweet => {
      console.log(tweet.text);
      roomsId.forEach(roomId => {
        client.sendTextMessage(roomId, "Nouveau tweet de "+tweet.user.name+" ("+tweet.user.screen_name+")\n"+tweet.text+"\nhttps://twitter.com/statuses/"+tweet.id_str);
      });
    });


  });

}
