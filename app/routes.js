module.exports = function(app) {
	// Home Page
	app.get("/", function(req, res) {
		res.render("index.ejs");
	});
};