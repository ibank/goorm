
module.exports = {
	attach_google_drive : function(google_drive_config){
		global.__social_key['possible_list'].push("google_drive")
		console.log('[Cloud] google_drive');
	}
}