	$notificationTemplate = $("#notification_template").html();
	$messageTemplate = $("#message_template").html();
	$messageBox = $("#newMessage");
	
	function htmlEscape(text){
		return text.replace(/[<>”&]/g, function(match, pos, originalText){
			switch(match){
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case "&":
					return "&amp;";
				case "\"":
					return "&quot;";
			}
		});
	}
	
	function submitMessage(isColored){
		var message = htmlEscape( $.trim( $messageBox.val()));
		if( message.length <=0){
			return;
		}
		
		if( message.length > 1024){
			alert("text too long("+ message.length + ").");
			return;
		}
		
		socket.emit('message',  message);
		var cssClass = bgColorClasses[parseInt( Math.random() *4)];
		if(isColored == false){
			cssClass = "";
		}
		$("#messages ul").append(
				"<li class='"+ cssClass +"'>" +
					_.template($messageTemplate, {nick:'me', "message":	message })	+
				"</li>");
		$messageBox.val("");
		$("#messages").scrollTop(10522);

	}
	
	
	$("#submit").bind( "click", function(e) {
		e.preventDefault();
		submitMessage(true);
	});	
	
	$("#newMessage").keypress( function(event){
		 if ( event.which == 13 ) {
				event.preventDefault();
				submitMessage(false);
			}
		$("#messageBox h3 span").text( $(this).val().length);
	});
	

	function showNotification(level, title, message){
		$("body").prepend(
	
		_.template($notificationTemplate, 
			{
				level: level,
				title: title,
				message:message
			})
		);
		
		setTimeout( function(){
			$(".notification").slideUp("slow").remove();
		}, 5000);
	
	}

	
	
	/*
	|| Random Color to User List
	||  parseInt( Math.random() *4)
	*/
	var bgColorClasses=["bg_red", "bg_green", "bg_yellow", "bg_skyBlue"];
	$("#users ul li").each( function(){
		color = bgColorClasses[parseInt( Math.random() *4)] ;
		$(this).attr("class","");
		$(this).addClass( color );
	});
	
	/*
	**
	*/
	
	
	/*
	||	 Socket.io events handlers
	||
	*/

	var socket = io.connect('/');
	var nick ="";
	socket.on('connect', function(data){
	
		$("#server-status").remove();
		nick = prompt("Enter your nick: ");
		if( nick.length===0){
			nick = parseInt(Math.random() * 10000);
			alert("You are identified as " +nick);
		}
		
		$("#newMessage").removeAttr("disabled");
		socket.emit("join", nick);
	});

	 
	socket.on("new message", function(data){	
		console.log(data);
		$("#messages ul").append(
			"<li class='"+ bgColorClasses[parseInt( Math.random() *4)] +"'>" +
		_.template($messageTemplate, data)	+
			"</li>"
		);
		$("#messages").scrollTop(10522);
		
	 });
	 
	socket.on("status", function(data){	
		showNotification("success", "Slammer", data.message);
		
		for( var k in data.onlineUsers){
			console.log( data.onlineUsers[k]);
			$("#users ul").append( "<li id='"+ data.onlineUsers[k].id +"' class='"+ bgColorClasses[parseInt( Math.random() *4)] +"'>"+ data.onlineUsers[k].name + "</li>");
		}
		

	 });
	 
	socket.on("new member", function(member){
		console.log("new Joinee : " + member.nick);
		showNotification("success", member.nick, " is online now.");
		
		$("#users ul").append( "<li id='"+ member.id +"' class='"+ bgColorClasses[parseInt( Math.random() *4)] +"'>"+ member.nick + "</li>");			
	});
	
	socket.on("leave", function(member){
	console.log(member);
		showNotification("error", member.nick, " goes offline.");
		$("#" + member.id).slideUp().remove();
	});

