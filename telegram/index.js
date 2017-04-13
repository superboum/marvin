var TelegramBot = require('node-telegram-bot-api');
var request = require('request');
var config = require('./config.json');

var bot             = new TelegramBot(config.tokens.telegram, { polling: true });
var weatherEndpoint = "https://api.darksky.net/forecast/"+config.tokens.forecastio+"/"+config.pos.lat+","+config.pos.long+"?exclude=minutely,hourly,daily,alerts,flags&lang=fr&units=ca";
var conversations   = [];

var getTimeBeforeNextLunch = function() {
  var target = new Date();
  target.setHours(11);
  target.setMinutes(55);
  target.setSeconds(0);
  var afternoon = target > new Date() ? 0 : 1;
  do {
    target.setDate(target.getDate() + afternoon);
  } while ([0,6].includes(target.getDay()));
  console.log("Next lunch: "+target);
  return target.getTime() - (new Date()).getTime();
};

var getWeather = function(cb) {
  request(weatherEndpoint, function (error, response, body) {
    if (error) {
      console.log(error);
      return;
    }
    var msg = [];
    var data = JSON.parse(body);

    // température
    if (data.currently.temperature < 15) msg.push(data.currently.temperature+"°C ? On se les gèle aujourd'hui !");
    else if (data.currently.temperature < 25) msg.push("Je te l'avais dit, "+data.currently.temperature+"°C ! Allez viens, on est bien.");
    else msg.push("Hmmmm "+data.currently.temperature+"°C, c'est chaud...");

    // pluie
    if (data.currently.precipProbability < 0.333) msg.push("Et sinon, pas de pluie à l'horizon");
    else if (data.currently.precipProbability < 0.666) msg.push("P'têt bien qu'il va pleuvoir, p'têt bien que non");
    else msg.push("Tu sais chéri, il pleure dans mon cœur comme il pleut sur la ville");

    msg.push("Sus aux victuailles ! /menu");
    cb(msg);
  });
};

var sendWeather = function(chatId) {
  getWeather(function(msg) {
    msg.forEach(function(elem, index) {
      setTimeout(function() {
        bot.sendMessage(chatId, elem);
      }, index*3000);
    });
  });
}

var broadcastWeather = function() {
  setTimeout(function() {
    conversations.forEach(sendWeather);
    broadcastWeather();
  }, getTimeBeforeNextLunch());
};

//+++++ Activation 

broadcastWeather();

bot.onText(/\/activate/, function (msg, match) {
  if (conversations.includes(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, "Mais, mais, je suis déjà là :'(");
    return;
  }
  bot.sendMessage(msg.chat.id, "Salut tout le monde !");
  conversations.push(msg.chat.id);
});

//bot.on('message', function (msg) {
  //var chatId = msg.chat.id;
  //bot.sendMessage(chatId, "Received your message");
//});
