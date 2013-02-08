
var project_fields = {
	project_author : String,
	project_name : String,
	project_path : String,
	project_type : String,
	author_id : String,
	author_type : String,
	collaboration_list : Array
};

var db = {
	project : mongoose.model('project', new Schema(project_fields))
}

module.exports = {
	add : function(project, callback){
		var doc = new db.project();
		
		for(var attr in project_fields){
			doc[attr] = project[attr];
		}
		doc.collaboration_list = [];
		doc.collaboration_list.push(project.author_id+'_'+project.author_type)

		doc.save(function(err){
			if(err) {
				console.log(err, 'Project Add Fail');
				if(callback) callback(false);
			}
			else if(callback) callback(true)
		});
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
	}
}