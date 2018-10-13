
const request = require('superagent');
const querystring = require('querystring');
const app = require('express')();
const url = require('url');
const http = require('http').Server(app);
const bodyParser = require('body-parser');

const secret = require('./secret.js'); //the file is not included in the repository

const token = secret.token; //'8bdb15d817f0e511c1c.........7f0';
const secretKey = secret.secretKey; //'c6f0158bd0a97f5..........015';




var payload_from = {
	"event_type" : "chat_message_received",
	"filters": [
		{
			"subprop_type": "event",
    	"subprop_key": "payload_name",
      "subprop_op": "is",
      "subprop_value": ["guest_start"]	// <= from
		}
	]
};


var payload_to = {
	"event_type" : "chat_message_received",
	"filters": [
		{
			"subprop_type": "event",
    	"subprop_key": "payload_name",
      "subprop_op": "is",
      "subprop_value": ["wv_01_inc_foreigner_start"]  // <= to	
		}
	]
};

var data = {
	e: [ JSON.stringify(payload_from) , JSON.stringify(payload_to) ],
  start: '20181012',
  end: '20181013'
}

request.get('https://amplitude.com/api/2/funnels')
    .auth(token, secretKey)
    .query(data)
    .set('Accept', 'application/json')
		.end((err, res) => {
      console.log(res)
		});

