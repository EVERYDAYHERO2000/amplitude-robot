const request = require('superagent');
const express = require('express');
const path = require('path');
const url = require('url');
const secret = require('./secret.js'); //the file is not included in the repository

const PORT = process.env.PORT || 5000;
const token = secret.token; //'8bdb15d817f0e511c1c.........7f0';
const secretKey = secret.secretKey; //'c6f0158bd0a97f5..........015';

express()
.all('/', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
	res.header("X-Requested-With", "XMLHttpRequest");
	res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET');
	res.header('content-type', 'application/json');
	res.header('X-Content-Type-Options', 'nosniff');
	next();
})
.get('/', (req, res) => {
	
	let url_parts = url.parse(req.url, true);

	let __from = url_parts.query.from;
	let __to = url_parts.query.to;
	let __start = url_parts.query.start;
	let __end = url_parts.query.end;

	//res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header('content-type', 'application/json');
	res.header('X-Content-Type-Options', 'nosniff');

	if (__from && __to && __start && __end) {

		amplitude(__from, __to, __start, __end, function (d) {

			let data = JSON.parse(d.text).data;

			let result = {
				status: 'Success',
				data: {
					from: {
						payload: __from,
						value: data[0].convertedCounts[0]
					},
					to: {
						payload: __to,
						value: data[0].convertedCounts[1]
					},
					start_date: __start,
					end_date: __end,
					difference: data[0].convertedCounts[0] - data[0].convertedCounts[1],
					conversion: data[0].convertedCounts[1] / data[0].convertedCounts[0] * 100,
					event_name: 'chat_message_received'
				}

			};

			res.send(JSON.stringify(result));

		});

	} else {

		res.send(JSON.stringify({
			status: 'Bad request'
		}));

	}
})
.listen(PORT, () => console.log(`Listening on ${ PORT }`))




function amplitude(from, to, start, end, callback) {

	var payload_from = {
		"event_type": "chat_message_received",
		"filters": [
			{
				"subprop_type": "event",
				"subprop_key": "payload_name",
				"subprop_op": "is",
				"subprop_value": [from] // <= from
		}
	]
	};

	var payload_to = {
		"event_type": "chat_message_received",
		"filters": [
			{
				"subprop_type": "event",
				"subprop_key": "payload_name",
				"subprop_op": "is",
				"subprop_value": [to] // <= to	
		}
	]
	};

	var data = {
		e: [JSON.stringify(payload_from), JSON.stringify(payload_to)],
		start: start,
		end: end
	}

	request.get('https://amplitude.com/api/2/funnels')
		.auth(token, secretKey)
		.query(data)
		.set('Accept', 'application/json')
		.end((err, res) => {

			if (res && callback) callback(res);

		});

}
