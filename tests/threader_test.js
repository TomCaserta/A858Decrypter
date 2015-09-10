var Threader = require("./../src/utils/threader.js");
var declib = require("./../main.js");
var Post = declib.Post;
var PostList = declib.PostList;
var csv = require("csv-parser");
var log = require('single-line-log').stdout;

var Key = declib.Key;
var Utils = declib.Utils;
var decrypterWorker = new Threader(4, "./src/workers/encrypt.js");
var fs = require("fs");
var worklist = [];
var posts = new PostList();
fs.createReadStream("./all.csv").pipe(csv({
	headers: ["title", "time", "body", "url"]
})).on("data", function (row) { 
	posts.push(Post.fromCSV(row));
	log("Loading posts: "+posts.getLength());
}).on("end", function () { 
		var n = 0;
	decrypterWorker.startUp();
	posts.forEach(function (post) {
		if (post.isHex()) {
			var data = post.body;
			var pl = post.body.length;
			for (var i = 0; i < pl; i+=16) {
				var key = post.body.substr(i, 16);
				if (key.length == 16) {
				try {
					var work = {
						task: "encrypt",
						key: key
					};
					n++;
					worklist.push(work);
				}
				catch (e) {
					throw key + " is not fucking hex?";
				}
				}

			}
		}
	});

	var progress = Utils.createProgressBar("Processing "+n+": ", n);
	worklist.forEach(function (work) { 
 		decrypterWorker.sendWork(work).then(function (data) { 
				progress.tick(1);
						console.log("Got work: ", data.identifier);
			},
			function (err) { 
				progress.tick(1);
			//console.log("Error: ", err);
		});
 	});
	
});