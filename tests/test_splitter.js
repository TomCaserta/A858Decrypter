var Threader = require("./../src/utils/threader.js");
var declib = require("./../main.js");
var Post = declib.Post;
var PostList = declib.PostList;
var csv = require("csv-parser");
var log = require('single-line-log').stdout;

var Key = declib.Key;
var Utils = declib.Utils;
//var decrypterWorker = new Threader(4, "./src/workers/encrypt.js");
var fs = require("fs");
var worklist = [];
var posts = new PostList();
fs.createReadStream("./all.csv").pipe(csv({
	headers: ["title", "time", "body", "url"]
})).on("data", function (row) { 
	posts.push(Post.fromCSV(row));
	//log("Loading posts: "+posts.getLength());
}).on("end", function () { 
		var n = 0;
//	decrypterWorker.startUp();
	posts.forEach(function (post) {
		if (post.isHex()) {
			var data = post.body;
			var pl = post.body.length;
			var name = parseInt(post.name);
			if (name <= 201107031600) {
				for (var i = 0; i < pl; i+=32) {
					var key = post.body.substr(i, 32);
					if (key.substr(13,1) != "4") {
						//worklist.push(key);
						worklist.push(key.substr(0,16));
					}

				}
			}
		}
	});

//	var progress = Utils.createProgressBar("Processing "+n+": ", n);
	worklist.forEach(function (key) { 
		console.log(key);
	});
	
});