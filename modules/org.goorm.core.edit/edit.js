/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/


var utils=require('util')
var exec=require('child_process').exec;
var EventEmitter = require("events").EventEmitter;

var parsed_data={};

module.exports = {
		get_dictionary : function(query,evt){
			var self=this;
			exec('ctags ./workspace/'+query.selected_file_path,function(err,stdout,stderr){
				exec('cat tags',function(err,stdout,stderr){
					var ctags_result=stdout;
					
					var len=query.selected_file_path.split(".").length;
					var type=query.selected_file_path.split(".")[len-1];
					//console.log('type',type);

					if(type=='c'){
						self.parsing_c(ctags_result,type);
					}
					else if(type=='cpp'){
						self.parsing_cpp(ctags_result,type);
					}
					else if(type=='java'){
						self.parsing_java(ctags_result,type);
					}else{
						console.log('another language');
					}
					//parsing end

					exec('rm tags',function(err,stdout,stderr){ });
					evt.emit("edit_get_dictionary", self.parsed_data);

				});
			});
		},

		parsing_c : function(input,input_type){
			var self=this;
			self.parsed_data={
					type : input_type,
					v:[],
					f:[]
			}
			var results=input.split("\n");
			for(var i=0;i<results.length;i++){
				if(results[i].indexOf("!")==0){
					continue;
				}
				else{
					if(results[i].indexOf('\t')!=-1){
						var len=results[i].split("\t").length;
						if(results[i].split("\t")[len-1]=='v'){
							self.parsed_data.v.push(results[i].split("\t")[0]);
						}
						else if(results[i].split("\t")[len-1]=='f'){
							self.parsed_data.f.push(results[i].split("\t")[0]);
						}
						else{
							// console.log('what type? ',results[i].split("\t")[3]);
							// if(parse_result[results[i].split("\t")[3]]==undefined){
							//   parse_result[results[i].split("\t")[3]]=[];
							// }
							// parse_result[results[i].split("\t")[3]].push(results[i].split("\t")[0]);
						}

					}
				}
			}
		},
		parsing_cpp : function(input,input_type){
			var self=this;
			self.parsed_data={
					type : input_type,
					v:[],
					f:[],
					c:[]
			}
			var results=input.split("\n");
			for(var i=0;i<results.length;i++){
				if(results[i].indexOf("!")==0){
					continue;
				}
				else{
					if(results[i].indexOf('\t')!=-1){
						var len=results[i].split("\t").length;
						if(results[i].split("\t")[len-1]=='v'){	
							self.parsed_data.v.push(results[i].split("\t")[0]);
						}
						else if(results[i].split("\t")[len-1]=='f'){
							self.parsed_data.f.push(results[i].split("\t")[0]);
						}
						else if(results[i].split("\t")[len-2]=='c'){
							self.parsed_data.c.push(results[i].split("\t")[0]);
						}
						else{
							// console.log('what type? ',results[i].split("\t")[3]);
							// if(parse_result[results[i].split("\t")[3]]==undefined){
							//   parse_result[results[i].split("\t")[3]]=[];
							// }
							// parse_result[results[i].split("\t")[3]].push(results[i].split("\t")[0]);
						}

					}
				}
			}

		},
		parsing_java : function(input,input_type){
			var self=this;
			self.parsed_data={
					type : input_type,
					v:[],
					m:[],
					c:[]
			}
			// f is property
			// m is method
			// c is class
			var results=input.split("\n");
			for(var i=0;i<results.length;i++){
				if(results[i].indexOf("!")==0){
					continue;
				}
				else{
					if(results[i].indexOf('\t')!=-1){
						var len=results[i].split("\t").length;
						if(results[i].split("\t")[len-2]=='f'){	//in java f means property that is variable
							self.parsed_data.v.push(results[i].split("\t")[0]);
						}
						else if(results[i].split("\t")[len-2]=='m'){
							self.parsed_data.m.push(results[i].split("\t")[0]);
						}
						else if(results[i].split("\t")[len-1]=='c'){
							self.parsed_data.c.push(results[i].split("\t")[0]);
						}
						else{
							// console.log('what type? ',results[i].split("\t")[3]);
							// if(parse_result[results[i].split("\t")[3]]==undefined){
							//   parse_result[results[i].split("\t")[3]]=[];
							// }
							// parse_result[results[i].split("\t")[3]].push(results[i].split("\t")[0]);
						}

					}
				}
			}

		}

		//...more language parsing



}

