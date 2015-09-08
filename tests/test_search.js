var Threader = require("./../src/utils/threader.js");
var declib = require("./../main.js");
var Post = declib.Post;
var PostList = declib.PostList;
var csv = require("csv-parser");
var log = require('single-line-log').stdout;

var Key = declib.Key;
var Utils = declib.Utils;
var fs = require("fs");
var worklist = [];
var posts = new PostList();
fs.createReadStream("./all.csv").pipe(csv({
	headers: ["title", "time", "body", "url"]
})).on("data", function (row) { 
	posts.push(Post.fromCSV(row));
	log("Loading posts: "+posts.getLength());
}).on("end", function () { 
	posts.forEach(function (post) {
		if (post.body.toLowerCase().indexOf("dbc1151614165637") != -1) {
			console.log("Found in "+ post.name);
		}
		else {
		//	console.log("Not found");
		}
	});

});