var express			= require("express"),
	app				= express(),
	http			= require("http").Server(app),
	io				= require("socket.io")(http),
	tcp 			= require("net").createServer(),
	morgan			= require("morgan"),
	clc				= require("cli-color"),
	events 			= require("events"),
	emitter 		= require("events").EventEmitter;

var http_port		= process.env.PORT || 80,
	tcp_port		= 1337,
	info			= clc.greenBright,
	notice			= clc.cyanBright;

// ==================== Configure ====================
var netduino = new emitter();
require("./config/tcp")(tcp, netduino);
require("./config/io")(io, netduino);

app.use(express.static("public"));
app.use(morgan("dev"));
app.set("view engine", "ejs");

// ====================== Route ======================
require("./app/routes.js")(app);

// ===================== Launch ======================
http.listen(http_port, "0.0.0.0", function () {
	console.log(notice("HTTP"), "listening on port:", info(http_port));
});

tcp.listen(tcp_port, "0.0.0.0", function () {
	console.log(notice("TCP"), "listening on port:", info(tcp_port));
});