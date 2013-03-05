
var project_fields = {
	project_author : String,
	project_name : String,
	project_path : String,
	project_type : String,
	author_id : String,
	author_type : String,
	collaboration_list : Array,
	invitation_list : Array,
	group_name : String // match gid
};

var db = {
	project : mongoose.model('project', new Schema(project_fields)),
}

var exec = require('child_process').exec;
var os = {

	// Group Add
	//
	//	author : project author
	//	users : []
	'get_new_group' : function(author){
		var new_group = author + '_' + (new Date()).getTime();

		return new_group;
	},


	'generate_group' : function(new_group){
		return 'addgroup ' + new_group;
	},

	'group_del' : function(){

	},

	'user_add' : function(group, user){
		return 'usermod -a -G ' + group + ' ' + user;
	}
}

module.exports = {
	add : function(project, callback){
		var doc = new db.project();
		for(var attr in project_fields){
			doc[attr] = project[attr];
		}
		doc.collaboration_list = [];
		doc.collaboration_list.push(project.author_id+'_'+project.author_type)

		this.get(project, function(exist_project){
			if(exist_project){
				console.log('Project already exists !');
				if(callback) callback(false);
			}else{
				doc.save(function(err){
					if(err) {
						console.log(err, 'Project Add Fail');
						if(callback) callback(false);
					}
					else if(callback) callback(true)
				});
			}
		})
	},

	// option : {} 
	//	project_path
	//	target_id
	//	target_type
	//
	push : function(option, callback){
		var project_path = option['project_path'];
		var target_id = option['target_id'];
		var target_type = option['target_type'];

		db.project.update({'project_path':project_path}, { $addToSet : { 'collaboration_list' : target_id+'_'+target_type } }, function(err){
			if(err){
				console.log(err);
				if(callback) callback(false)
			}
			else if(callback){
				 callback(true)
			}
		});
	},

	// target_list : [ user_id_type1, user_id_type2, ... ]
	//
	push_all : function(option, callback){
		var project_path = option['project_path'];
		var target_list = option['target_list'];

		db.project.update({'project_path':project_path}, { $addToSet: { 'collaboration_list' : { $each : target_list } } }, function(err){
			if(err){
				console.log(err);
				if(callback) callback(false)
			}
			else if(callback){
				 callback(true)
			}
		})
	},

	pull : function(option, callback){
		var project_path = option['project_path'];
		var target_id = option['target_id'];
		var target_type = option['target_type'];

		db.project.update({'project_path':project_path}, { $pull : { 'collaboration_list' : target_id+'_'+target_type } }, function(err){
			if(err){
				console.log(err);
				if(callback) callback(false)
			}
			else if(callback){
				 callback(true)
			}
		});
	},

	invitation_push : function(option, callback){
		var project_path = option['project_path'];
		var target_id = option['target_id'];
		var target_type = option['target_type'];

		db.project.update({'project_path':project_path}, { $addToSet : { 'invitation_list' : target_id+'_'+target_type } }, function(err){
			if(err){
				console.log(err);
				if(callback) callback(false)
			}
			else if(callback){
				 callback(true)
			}
		});
	},

	invitation_pull : function(option, callback){
		var project_path = option['project_path'];
		var target_id = option['target_id'];
		var target_type = option['target_type'];

		db.project.update({'project_path':project_path}, { $pull : { 'invitation_list' : target_id+'_'+target_type } }, function(err){
			if(err){
				console.log(err);
				if(callback) callback(false)
			}
			else if(callback){
				 callback(true)
			}
		});
	},

	get : function(option, callback){
		db.project.findOne({'project_path':option['project_path']}, function(err, data){
			callback(data);
		})
	},

	// All List
	//
	get_all_list : function(option, callback){
		db.project.find({}, function(err, data){
			callback(data);
		});
	},

	// option
	//	project_path : project_path
	//	query : id or name or nick
	//
	get_no_co_developers_list : function(option, callback){
		var self = this;
		var user_list = option['user_list'];

		this.get(option, function(project_data){
			if(project_data && user_list){
				user_list = user_list.filter(function(o){
					var user_id_type = o.id + '_' + o.type;
					var collaboration_list = project_data.collaboration_list;

					if(collaboration_list.indexOf(user_id_type) != -1){
						return false
					}
					else{
						return true
					}
				})

				callback(user_list);
			}
			else{
				callback([]);
			}
		});
	},

	// Owner List
	//
	get_owner_list : function(option, callback){
		var prj_data = {
			author_id : option['author_id'],
			author_type : option['author_type']
		}

		db.project.find(prj_data, function(err, data){
			callback(data);
		})
	},

	// All project list
	//
	get_collaboration_list : function(option, callback){
		var author_id = option['author_id'];
		var author_type = option['author_type'];

		db.project.find({'collaboration_list' : {$in : [author_id+'_'+author_type] }}, function(err ,data){
			callback(data);
		});
	},

	remove : function(option, callback){
		db.project.remove({project_path:option['project_path']}, function(err){
			if(!err && callback) callback(true);
			else{
				console.log(err);
				if(callback) callback(false);
			}
		});
	},

	add_group : function(option, callback){
		var self = this;

		var author = option['author']; // user id
		var project_path = option['project_path'];

		// 1. get new group
		//
		var new_group = os.get_new_group(author);

		// 2-1. add group to ubuntu
		//
		g_exec(os.group_generate(author), function(group_generate_result){

			// 3. user add
			//

		});

		// 2-2. add group to db 
		//
		var set_group_data = {
			'project_path' : project_path,
			'new_group' : new_group
		}

		this.set_group(set_group_data);
	},

	set_group : function(option, callback){
		var project_path = option['project_path'];
		var new_group = option['new_group']

		db.project.update({'project_path':project_path}, {$set : {'group_name' : new_group}}, function(err){
			if(err){
				console.log(err);
				if(callback) callback(false)
			}
			else{
				if(callback) callback(true);
			}
		});	
	},

	g_exec : function(command, callback){
		exec(command, function(err, stdout, stderr){
			if(err){
				console.log(err, stdout, stderr);
				callback(false)
			}else{
				callback(true)
			}
		})
	}	
}