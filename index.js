//REQUIRE
var Twit = require('twit')
var slackAPI = require('slackbotapi');
var config = require('./config.json');

//API CONF
var slack = new slackAPI(config.slack.auth);

var T = new Twit(config.twitter.auth);

var seen = [];
 
var stream = T.stream('statuses/filter', {follow: config.twitter.follow, track: config.twitter.track });

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


