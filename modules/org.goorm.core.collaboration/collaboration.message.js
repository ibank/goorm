
var message_fields = {
	type : String,
	from : Array, 	// [ {id1,type1}, {id2,type2} ]
	to : Array,		// [ {id1,type1}, {id2,type2} ]
	checked : Boolean,
	data : String, 	// JSON.stringify({ ... }),
	create_time : Date
};

var db = {
	message : mongoose.model('message', new Schema(message_fields))
}

var format = {

	get_object_id : function(_id){
		return new ObjectId(_id.toString());
	},

	// target : object
	//
	stringify : function(target){
		var o = {};
		for(var attr in message_fields){
			o[attr] = target[attr];
			if(attr == 'from' || attr == 'to'){
				o[attr] = target[attr].map(function(__o){
					return JSON.stringify(__o);
				})
			}
			if(attr == 'data'){
				o[attr] = JSON.stringify(target[attr]);
			}
		}

		return o;
	},

	parse : function(target){
		var o = {};
		for(var attr in message_fields){
			o[attr] = target[attr];
			if(attr == 'from' || attr == 'to'){
				o[attr] = target[attr].map(function(__o){
					return JSON.parse(__o);
				})
			}
			if(attr == 'data'){
				o[attr] = JSON.parse(target[attr]);
			}
		}

		o['_id'] = target['_id'];
		return o;
	},

	type : ['invite_user', 'quiz_start', 'quiz_end']
}

module.exports = {
	add : function(message, callback){
		var doc = new db.message(format.stringify(message));
		doc.create_time = new Date();

		doc.save(function(err){
			if(err) {
				console.log(err, 'Message Add Fail');
				if(callback) callback(false);
			}
			else if(callback) callback(true);
		});
	},

	edit : function(messagedata, callback){
		var self = this;
		
		var message = {};
		
		for(var attrname in message_fields){
			if(messagedata[attrname] != undefined)
				message[attrname] = messagedata[attrname];
		}

		db.message.update({'_id': format.get_object_id(messagedata._id)}, {$set:message}, null, function(err){
			if ( !err ) {
				callback({
					result : true,
					data : messagedata
				});	
			} else {
				callback({
					result : false
				}); 
			}
		});
	},

	del : function(messagedata, callback){
		db.message.remove({'_id': format.get_object_id(messagedata._id)}, function(err){
			if(err){
				console.log(err);
				callback(false);
			}
			else{
				callback(true);
			}
		});
	},

	get : function(option, callback){
		var user_id = option['user_id'];
		var user_type = option['user_type'];

		var user = JSON.stringify({
			'id':user_id,
			'type':user_type
		})

		db.message.findOne({ $or : [{'from':{$in:[user]}}, {'to':{$in:[user]}}], '_id': format.get_object_id(option['_id']) }, function(err, data){
			if(data){
				data = format.parse(data);
			}

			callback(data);
		})
	},

	get_list : function(option, callback){
		var user_id = option['user_id'];
		var user_type = option['user_type'];

		var user = JSON.stringify({
			'id':user_id,
			'type':user_type
		})

		db.message.find({ $or : [{'from':{$in:[user]}}, {'to':{$in:[user]}}] }).sort({'create_time':-1}).limit(10).exec(function(err, data){
			if(data){
				data = data.map(function(o){
					return format.parse(o);
				});
			}

			callback(data);
		})
	},

	get_receive_list : function(option, callback){
		var user_id = option['user_id'];
		var user_type = option['user_type'];

		var user = JSON.stringify({
			'id':user_id,
			'type':user_type
		})

		db.message.find({'to':{$in:[user]}}).sort({'create_time':-1}).limit(10).exec(function(err, data){
			if(data){
				data = data.map(function(o){
					return format.parse(o);
				});
			}

			callback(data);
		})
	},

	get_unchecked : function(option, callback){
		var user_id = option['user_id'];
		var user_type = option['user_type'];

		var user = JSON.stringify({
			'id':user_id,
			'type':user_type
		})

		db.message.find({'to':{$in:[user]}, 'checked':false }).count(function(err, data){
			callback(data);
		})
	}

	// get_to_list : function(option, callback){
	// 	var user_id = option['user_id'];
	// 	var user_type = option['user_type'];

	// 	db.message.find({'to':user_id+'_'+user_type}, function(err, data){
	// 		callback(data);
	// 	});
	// },

	// get_from_list : function(option, callback){

	// }
}