/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var weather = require('weather-js');
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hi there, I am Little Raspberry"); //We start with the introduction;
    setTimeout(timedQuestion, 5000, socket, "What is your name?"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;
  
var ans;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = 'Hello ' + input + ', nice to meet you'; // output response
    waitTime = 5000;
    question = 'Do you want to know the exact time and date?'; // load next question
  } else if (questionNum == 1) {
    if (input.toLowerCase() == 'yes') {
      var today = new Date();
      var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var curHr = today.getHours();
      var greeting;
      if (curHr < 12) {
        greeting = "Good morning!";
      } else if (curHr < 18) {
        greeting = "Good afternoon!";
      } else {
        greeting = "Good evening!";
      }

      answer = greeting + 'Today is ' + date + ' and the time is ' + time;
      mode = 1;
      waitTime = 5000;
      question = 'Do you want to know the weather as well?';
    } else {
      answer = 'Ok fine.'
      mode = 2;
      waitTime = 5000;
      question = 'Then I guess you will want to know the weather?';
    }
  } else if (questionNum == 2) {
    if (input.toLowerCase() == 'yes') {
      answer = 'Great'
      waitTime = 5000;
      question = 'In what city do you live?';
    } else {
      answer = 'Oops, I just want to show you want I can do'
      waitTime = 5000;
      question = 'In what city do you live?';
    }
  } else if (questionNum == 3) {
    weather.find({
      search: input,
      degreeType: 'F'
    }, function (err, result) {
      if (err) console.log(err);
      console.log(result[0]);
      ans = result[0];
    });

    answer = 'Currently in New York it is sunny and 72 degrees';
    waitTime = 5000;
    question = 'Do you want to know tomorrow\'s weather as well?'
   } else if (questionNum == 4) {
     if (input.toLowerCase() == 'yes') {
       answer = 'Tomorrow it will be rainy and 65 degrees';
       waitTime = 5000;
       question = 'Do you want to know the weather of another city?';
     } else {
       answer = 'What a pity'
       waitTime = 5000;
       question = 'Do you want to know the weather of another city?';
     }
   } else if (questionNum == 5) {
     if (input.toLowerCase() == 'yes') {
       answer = 'Great!';
       waitTime = 3000;
       question = 'What city do you want to check?';
       questionNum = 3;
     } else {
       answer = 'Alright, see you next time.'
       waitTime = 5000;
     }
    }



  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
© 2019 GitHub, Inc.
