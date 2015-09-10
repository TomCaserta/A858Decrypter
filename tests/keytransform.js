var declib = require("./../main.js");
var Post = declib.Post;
var PostList = declib.PostList;
var csv = require("csv-parser");
var log = require('single-line-log').stdout;

var Key = declib.Key;
var KeyTransformer = declib.KeyTransformer;
var Utils = declib.Utils;
var fs = require("fs");
var worklist = [];
var posts = new PostList();
var splitLen = 32;

fs.createReadStream("./all.csv").pipe(csv({
	headers: ["title", "time", "body", "url"]
})).on("data", function (row) { 
	posts.push(Post.fromCSV(row));
	log("Loading posts: "+posts.getLength());
}).on("end", function () { 
	console.log("Splitting posts");
	var n = 0;
	posts.forEach(function (post) {
		if (post.isHex()) {
			var data = post.body;
			var pl = post.body.length;
			for (var i = 0; i < pl; i+=1) {
				var key = post.body.substr(i, splitLen);
				if (key.length == splitLen) {
					var hash = KeyTransformer.transformKey(key, ["dehex","md5"]);
					if (hash.toLowerCase() == "f8278df7c61e8ed0b77cb19c2b0e6e20") {
						console.log("Got key md5: ", key, post.name);
					}
					if (key == "f8278df7c61e8ed0b77cb19c2b0e6e20") {
						console.log("Got partial key", key,post.name);
					}
				}
				else {
					n++;
					log("Posts without correct length "+n+" Key: "+key+" "+i+" "+splitLen);
				}

			}
		}
	});
		console.log("\nSplit Post");

	
});