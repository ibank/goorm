var bingo = {
	is_my_turn: Boolean,
	socket: null,
	
	init: function () {
		var self = this;
		
		//initialize
		this.is_my_turn = true;
		
		this.socket = io.connect('http://localhost:3000');
		
		this.socket.on("check_number", function (data) {
			self.where_is_it(data.num);
			self.print_msg(data.username + " checked '" + data.num + "'");
		});
	
		this.socket.on("game_started", function (data) {
			self.print_msg(data.username + " started this game.");
			$("#start_button").hide();
		});
		
		this.socket.on("update_users", function (data) { 
			self.update_userlist(data);
		});
		
		//join
		this.socket.on("connect", function () {
			self.socket.emit("join", { username: $("#username").val() });
		});
			
		var numbers = [];
		for (var i=1; i<=25; i++) {
			numbers.push(i);
		}
	
		numbers.sort(function (a, b) {
			var temp = parseInt(Math.random() * 10);
			var isOddOrEven = temp % 2;
			var isPosOrNeg = temp > 5 ? 1 : -1;
			return (isOddOrEven*isPosOrNeg);
		});
	
		$("table.bingo-board td").each(function (i) {
			$(this).html(numbers[i]);
			
			$(this).click(function () {
				self.select_num(this);
			});
		});
		
		$("#start_button").click(function () {
			self.socket.emit("game_start", { username: $("#username").val() });
			self.print_msg("You started this game.");
			$("#start_button").hide();
		});
	}, 
	
	select_num: function (obj) {
		if (this.is_my_turn && !$(obj).attr("checked")) {
			//send num to other players
			this.socket.emit("select", { username: $("#username").val(), num: $(obj).text() });
			
			this.check_num(obj);
			
			this.is_my_turn = false;
		}
		else {
			this.print_msg("it is not your turn!");
		}
	},
	
	where_is_it: function (num) {
		var self = this;
		var obj = null;
		
		$("table.bingo-board td").each(function (i) {
			if ($(this).text() == num) {
				self.check_num(this);
			}
		});
	},
	
	check_num: function (obj) {
		$(obj).css("text-decoration", "line-through");
		$(obj).css("color", "#ccc");
		$(obj).css("background-color", "#999");
		$(obj).attr("checked", true);
	},
	
	update_userlist: function (data) {
		var self = this;
		
		$("#list").empty();
		
		$.each(data, function (key, value) {
			var turn = "(-)&nbsp;";
		
			if (value.turn == true) {
				turn = "(*)&nbsp;";
			
				if (value.name == $("#username").val()) {
					self.is_my_turn = true;
				}
			}
		
			$("#list").append(turn + value.name + "<br />");
		});
		
	},
	
	leave: function () {
	
	},
	
	print_msg: function (msg) {
		$("#logs").append(msg + "<br />");
	}
};


$(document).ready(function () {
	bingo.init();
});