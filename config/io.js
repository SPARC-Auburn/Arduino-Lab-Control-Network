var clc = require("cli-color"),
	fs	= require("fs");

var error		= clc.red.bold,
	warn		= clc.yellowBright,
	info		= clc.greenBright,
	notice		= clc.cyanBright;

var MSG_ENABLE	= "AN ENBL",
	MSG_DISABLE	= "AN DSBL";

var clients = {};
var arduinos = {};
var connections = {};
module.exports = function(io, netduino) {
	io.on("connection", function(socket) {
		var address = socket.handshake.address;
		console.log("Client@"+info(address), notice("connected"));
		clients[address] = socket;

		socket.emit("arduino-list", connections);

		socket.on("arduino-enable", function(node) {
			console.log("Client@"+info(address), notice("Enabling"), info(node.address));
			arduinos[node.address].socket.write(MSG_ENABLE);
			connections[node.address].user = node.user_name;
			connections[node.address].prof = node.user_prof;
			connections[node.address].enabled = true;
			updateClients();
			arduinos[node.address].timer.start();
		});
		
		socket.on("arduino-disable", function(node) {
			console.log("Client@"+info(address), warn("Disabling"), info(node.address));
			arduinos[node.address].socket.write(MSG_DISABLE);

			var date = new Date().toISOString()
				.replace("-", "_").replace(/T.+/, "");
			var connection = JSON.parse(JSON.stringify(connections[node.address])); //clone the obj since the call is async
			saveLog("./Logs/", "log_"+date+".txt",
				node.address, connection);

			connections[node.address].user = "None";
			connections[node.address].prof = "N/A";
			connections[node.address].time = 0;
			connections[node.address].enabled = false;
			arduinos[node.address].timer.stop();
			arduinos[node.address].timer.reset();
			updateClients();
		});

		socket.on("disconnect", function() {
			console.log("Client@"+info(address), error("disconnected"));
			if (arduinos.hasOwnProperty(address))
				delete clients[address];
		});
	});

	netduino.on("connect", function(address, socket, arduino) {
		arduinos[address] = {
			socket: socket,
			timer: new stopwatch(),
		};
		connections[address] = arduino;
		updateClients();
	});

	netduino.on("disconnect", function(address) {
		if (arduinos.hasOwnProperty(address))
			delete arduinos[address];
		if (connections.hasOwnProperty(address))
			delete connections[address];
		updateClients();
	});
};

function saveLog(file_dir, file_name, node_address, connection)
{			
	fs.stat(file_dir, function(err, stats) {
		if (err) {					
			fs.mkdir(file_dir, function(err) {
				if (err) console.log(error(err));
				else console.log("Created directory", file_dir);
			});
		}

		var info = 
			"User:      " + connection.user + "\n" + 
			"Professor: " + connection.prof + "\n" + 
			"Time used: " + connection.time + " minute(s)\n" + 
			"Node used: " + node_address    + "\n\n";
		fs.appendFile(file_dir+file_name, info, function(err) {
			if (err) console.log(error(err));
			else console.log("Log saved.");
		});
	});
}

setInterval(update, 60000);
function update() {
	updateClients();
}

function updateClients() {
	for (address in connections) {
		if (connections[address].enabled) {
			if (arduinos.hasOwnProperty(address)) {
				connections[address].time = arduinos[address].timer.getMinutes();
			} else {
				console.log(error("connections and arduinos address list dont match"));
			}
		}
	}
	for (address in clients) {
		clients[address].emit("arduino-list", connections);
	}
}

var stopwatch = function(delay) {
	var offset,
		clock,
		interval;

	delay = delay || 1000;

	reset();
	
	function start() {
		if (!interval) {
			offset = Date.now();
			interval = setInterval(update, delay);
		}
	}

	function stop() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}
	
	function reset() {
		clock = 0;
	}

	function getMillis() {
		return clock;
	}

	function getSeconds() {
		return Math.ceil(clock / 1000);
	}

	function getMinutes() {
		return Math.ceil(clock / 60000);
	}

	function delta() {
		var now = Date.now(),
			d = now - offset;
		offset = now;
		return d;
	}

	function update() {
		clock += delta();
	}

	this.start = start;
	this.stop = stop;
	this.reset = reset;
	this.getMillis = getMillis;
	this.getSeconds = getSeconds;
	this.getMinutes = getMinutes;
}