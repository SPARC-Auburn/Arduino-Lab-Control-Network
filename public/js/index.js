var socket = io();

$(document).ready(function() {
	console.log("Ready!");

	socket.on("arduino-list", function(arduinos) {
		console.log("Updating");
		$("#node-table").html("");
		for (address in arduinos) {
			var td1 = $("<td></td>").text(address);
			var td2 = $("<td></td>").text(arduinos[address].user);
			var td3 = $("<td></td>").text(arduinos[address].time + " minute(s)");

			var enabled_btn = $("<button>Enable</button>").click(function() {
				var user = verify();
				if (typeof user === "undefined")
					return;

				console.log("Enabling: " + address);
				enabled_btn.hide();
				disabled_btn.show();

				socket.emit("arduino-enable", {
					address: address,
					user_name: user.name,
					user_prof: user.prof,
				});
			});
			var disabled_btn = $("<button>Disable</button>").click(function() {
				console.log("Disabling: " + address);
				enabled_btn.show();
				disabled_btn.hide();
				
				socket.emit("arduino-disable", {
					address: address,
					user: "None",
				});
			});

			if (arduinos[address].enabled == false) {
				enabled_btn.show();
				disabled_btn.hide();
			} else {
				enabled_btn.hide();
				disabled_btn.show();
			}

			
			var td4 = $("<td></td>").append(enabled_btn).append(disabled_btn);
			var tr = $("<tr></tr>").append(td1).append(td2)
				.append(td3).append(td4);
			$("#node-table").append(tr);
		}
	});
});

function verify()
{
	var name = $("#user-name").val();
	var prof = $("#user-prof").val();
	$("#user-name").val("");
	$("#user-prof").val("");

	if (name == "" || prof == "")
		return alert("You must enter your name and the name of your professor.");
	else
		return {name: name, prof: prof};
}