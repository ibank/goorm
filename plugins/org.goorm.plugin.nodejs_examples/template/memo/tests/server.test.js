var assert = require('assert')
	, server= require('../app.js')
	, querystring = require('querystring');

var test_uuid = Date.now();

module.exports = {
	'main page connection test': function(beforeExit, assert) {
		assert.response(server, {
			url: '/'
		}, {
			status: '200',
			headers: {
				'Content-Type': 'text/html; charset=utf-8'
			}
		});
		
		this.on('exit', function () {
			
		});
	},
	
	'memo list test': function(beforeExit, assert) {
		assert.response(server, {
			url: '/load',
			method: 'GET'
		}, {
			status: '200',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		});
		
		this.on('exit', function () {
			
		});
	},
	
	'write memo test': function(beforeExit, assert) {
		assert.response(server, {
			url: '/write',
			method: 'POST',
			data: querystring.stringify({
				'author': 'test_user_' + test_uuid,
				'contents': 'test_contents' + test_uuid
			}),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}, {
			status: '200',
			body: '{"status":"SUCCESS"}',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}, function (res) {
			server.close();
			
			assert.response(server, {
				url: '/load',
				method: 'GET'
			}, {
				status: '200',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				}
			}, function (res) {
				//server.close();
				assert.ok(res.body.indexOf('test_user_' + test_uuid) >= 0);
			});
		});
		
		this.on('exit', function () {
			
		});
	},
	
	'delete memo test': function(beforeExit, assert) {
		var _id = null;
		
		assert.response(server, {
			url: '/load',
			method: 'GET'
		}, {
			status: '200',
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			}
		}, function (res) {
			server.close();
			
			var data = JSON.parse(res.body);
			
			for (var i=0; i<data.length; i++) {
				if (data[i].author == 'test_user_' + test_uuid) {
					_id = data[i]._id;
				}
			}
			
			assert.response(server, {
				url: '/del',
				method: 'POST',
				data: querystring.stringify({'_id': _id}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}, {
				status: '200',
				body: '{"status":"SUCCESS"}',
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				}
			}, function (res) {
				server.close();
				
				assert.response(server, {
					url: '/load',
					method: 'GET'
				}, {
					status: '200',
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					}
				}, function (res) {
					//server.close();
					assert.ok(res.body.indexOf('test_user_' + test_uuid) < 0);
				});
			});
		});
		
		this.on('exit', function () {
			
		});
	}
};