var clc = require("cli-color"),
	fs	= require("fs");

var error	= clc.red.bold,
	warn	= clc.yellowBright,
	info	= clc.greenBright,
	notice	= clc.cyanBright;

var TIMEOUT					= 10000,
	MSG_CLIENT_EN_VERIFY	= "AN EVFY",
	MSG_CLIENT_DS_VERIFY	= "AN DVFY",
	MSG_SERVER_VERYIFY		= "AN SVFY",
	MSG_ENABLE				= "AN ENBL",
	MSG_DISABLE				= "AN DSBL",
	MSG_ACK					= "AN  ACK",
	MSG_POLL				= "AN POLL";


var arduinos = {};
module.exports = function(tcp, netduino) {
	tcp.on("connection", function (socket) {
		var address = socket.address().address;
		console.log("Arduino@"+info(address), notice("connected"));

		socket.setTimeout(TIMEOUT, function() {
			console.log("Arduino@"+warn(address), error("timed out"));
			socket.destroy();
		});

		socket.on("data", function(data) {
			switch(String(data)) {
				case MSG_CLIENT_EN_VERIFY:
					console.log("Arduino@"+info(address), notice("verified enabled"));
					socket.write(MSG_SERVER_VERYIFY);
					var arduino = {
						user: "None",
						time: 0,
						enabled: true,
					};
					arduinos[address] = socket;
					netduino.emit("connect", address, socket, arduino);
					break;

				case MSG_CLIENT_DS_VERIFY:
					console.log("Arduino@"+info(address), notice("verified disabled"));
					socket.write(MSG_SERVER_VERYIFY);
					var arduino = {
						user: "None",
						time: 0,
						enabled: false,
					};
					arduinos[address] = socket;
					netduino.emit("connect", address, socket, arduino);
					break;

				case MSG_POLL:
					// console.log("Arduino"+"@"+info(address), "poll acknowledged");
					socket.write(MSG_ACK);
					break;

				default:
					console.log("Arduino@"+error(address), warn("unkown msg:"));
					console.log(String(data));
					break;
			}
		});

		socket.on("close", function(had_error) {
			console.log("Arduino@"+warn(address), error("disconnected"));
			netduino.emit("disconnect", address);
			delete arduinos[address];
		});

		socket.on("error", function(err) {
			if (err.code == "ECONNRESET") {
				console.log("Arduino@"+warn(address), error("connection reset"));
			} else {
				console.log(error("Error:"), err.stack);
			}
		});
	});
};