/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

/*
//스키마
var schema = {
	id: String,
	auth_type: String,
	pw: String,
	name: String,
	nick: String,
	email: String,
	email_chk: Boolean,
	level: Number,     
	point: Number,
	deleted: Boolean,	
	extra: String
};

var Member = mongoose.model('member', new Schema(schema));

module.exports = {

	add: function(new_member, callback){

		var doc = new Member();
		for(var attrname in schema){
			doc[attrname] = new_member[attrname];
		}
		doc.deleted = false;
		

		doc.save(function (err) {
		    if (!err){
		    	callback(true);
		    }else{
		    	console.log(err, 'dao.member : Member add failed');
		    	callback(false);
		    }
		});
	},
	
	
	get: function(id, callback){
		Member.findOne({id: id}, function(err, result){
	
			if ( result ) {
	
				var ret={};
				for(var attrname in schema){
					ret[attrname] = result[attrname];
				}
				callback(ret);
			}else{
				callback(false)
			}
		});
	},
	

	get_by_nick: function(nick, callback){
		Member.findOne({nick: nick}, function(err, result){
			if ( result ) {
				var ret={};
				for(var attrname in schema){
					ret[attrname] = result[attrname];
				}
				callback(ret);
			}else{
				callback(false)
			}
		});
	},
	

	remove: function(id, callback){
		console.log(id);
		Member.update({id: {$in: id}},{$set:{deleted:true}}, {multi:true}, function(err){
 
			if ( !err) {
				callback(true);
			} else {
				console.log('member_dao : Member Removing [fail]');
				callback(false);
			}
		});
	},
	

	set: function(id, new_member, callback){
		var member = {};
		for(var attrname in new_member){
			member[attrname] = new_member[attrname];
			if(member[attrname] == 'false') member[attrname] = false;
			if(member[attrname] == 'true') member[attrname] = true;
		}
		console.log(member);
		Member.update({id:id}, {$set:member}, null, function(err){
			if ( !err ) {
				console.log('member_dao : Member updating [success]');
				callback(true);	
			} else {
				console.log('member_dao : Member updating [fail]', err);
				callback(false); 
			}
		});
	},

	get_list: function(callback){
		Member.find({deleted:false}, function(err, result){
			if(!err){
				callback(result);
			}else{
				callback(null);
			}
		});
	}
}
*/
