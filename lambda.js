var querystring = require('querystring'),
    https = require("https");

var TOKEN = 'YOUT_LIFX_TOKEN';

exports.handler = function(event, context, callback) {
    var clickType = event.clickType;

    if (clickType === 'SINGLE') {
        _request('POST', '/v1/lights/all/toggle', {}, callback);
    } else if (clickType === 'DOUBLE') {
        _request('GET', '/v1/lights/all', {}, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            if (data.length === 0) {
                callback(new Error('Total number of lights is 0'));
                return;
            }

            var light = data[0],
                targetBrightness = light.brightness > 0.5 ? 0.2 : 1;

            _request('PUT', '/v1/lights/all/state',
                { "power": "on", "brightness": targetBrightness, "duration": 3 }, callback);
        });
    } else {
        callback(new Error('Unknown clickType ' + clickType));
    }
}

function _request(method, path, data, callback) {
    var postData = JSON.stringify(data);
    var options = {
    	hostname: 'api.lifx.com',
    	port: 443,
    	path: path,
    	method: method,
    	headers: {
    		'Authorization': 'Bearer ' + TOKEN,
    		'Accept': '*/*',
    		'content-type': 'application/json',
    		'content-length': postData.length

    	}
    };

    var req = https.request(options, function(res) {
    	res.setEncoding('utf8');
    	res.on('data', function (body) {
    		console.log('Body: ' + body);
    		callback(null, JSON.parse(body));
    	});
    });

    req.on('error', function(e) {
    	console.log('problem with request: ' + e.message);
    	callback(new Error(e.message));
    });

    req.write(postData);
    req.end();
}
