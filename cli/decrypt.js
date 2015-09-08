#!/usr/bin/env node

var declib = require("./../main.js");
var crypto = require("crypto");
var fs = require("fs");
var csv = require("csv-parser");
var log = require('single-line-log').stdout;

var commandLineArgs = require("command-line-args");
var Post = declib.Post;

var Key = declib.Key;
var PostList = declib.PostList;
var KeyList = declib.KeyList;
var Utils = declib.Utils;
var Decrypter = declib.Decrypter;
var KeyTransformer = declib.KeyTransformer;
var PostPreprocessor = declib.PostPreprocessor;

var modes = [];
var posts = new PostList();
var keys = new KeyList();
var initializationTime = new Date();
var potentialCiphers = crypto.getCiphers();
var isoDate = initializationTime.getFullYear() + "-"+ Utils.pad(initializationTime.getMonth()+1,2)+ "-"+ Utils.pad(initializationTime.getDate(),2)+ "-"+Utils.pad(initializationTime.getHours(),2)+":"+Utils.pad(initializationTime.getMinutes(),2)+":"+Utils.pad(initializationTime.getSeconds(),2);

var defaults = {
	 "preprocessor": [],
	 "out-ascii": "./["+isoDate+"][ASCII][Results].txt",
	 "out-unicode": "./["+isoDate+"][UNICODE][Results].txt",
	 "reprocess": false,
	 "in-file": "./all.csv",
	 "errors": "./error.log",
	 "key-file": "./keys.txt",
	 "threads": 10,
	 "modes": ["des-ede"],
	 "iv-separator": "=",
	 "all-ciphers": false,
	 "key-transform": ["none"],
	 "out-csv": "["+isoDate+"]hex-posts.csv"
};

var api = {
	"addPost": function (post) { 
		posts.push(post);
	},
	"addKey": function (key) {
		var processKey = transformKey(commands["key-transform"], key);
		keys.push(processKey);
	}
};

var cli = commandLineArgs([
	{ name: "help", alias: "h", description: "Show this usage information"},
    { name: "preprocessor", alias: "p", defaultValue: defaults["preprocessor"], multiple: true, type: String,  description: "Specifies javascript files of which exports a function that pre-processes the post data into keys, ivs or mutates the post. View the API to see what you can do at the GitHub project." },
    { name: "out-ascii", alias: "o", defaultValue: defaults["out-ascii"], type: String,  description: "File to place ASCII encoded output" },
    { name: "out-unicode", alias: "u", defaultValue: defaults["out-unicode"], type: String,  description: "File to place Unicode encoded output"},
  	{ name: "out-csv", alias: "c", defaultValue: defaults["out-csv"], type: String, description: "Output the decrypted results to a new file if the decrypted posts was hex, ready for reprocessing" },
    { name: "in-file", alias: "i", defaultValue: defaults["in-file"], type: String, description: "CSV File containing A858 post data" },
    { name: "errors", alias: "e", defaultValue: defaults["errors"], type: String, description: "Out file for errors" },
    { name: "key-file", alias: "k", defaultValue: defaults["key-file"], type: String, description: "Line separated keys. May specify IVs on the same line usng key=iv. You can change this separater using the -iv-seperator switch"  },
    { name: "iv-separator", alias: "s", defaultValue: defaults["iv-seperator"],type: String, description: "The seperator for the IV in the key file."  },
    { name: "workers", alias: "w", defaultValue: defaults["threads"], type: Number, description: "Number of worker threads to use"  },
    { name: "modes", alias: "m", defaultValue: defaults["modes"], type: String, multiple: true, description: "The cipher modes to use, allowed ciphers: "+  potentialCiphers.join(", ")+"\nDefaults to: "+defaults["modes"].join(", ")},
    { name: "all-ciphers", alias: "a", defaultValue: defaults["all-ciphers"], type: Boolean, description: "Switch if it should decrypt using all possible ciphers" },
    { name: "key-transform", alias: "t", defaultValue: defaults["key-transform"], multiple: true, type: String, description: "Specifies whether to use a transform on the key. Defaults to none. Potential transforms are: "+ KeyTransformer.getTransforms().join(", ") +"\nTransforms are processed in order. Hashing algorithms output in hex so you may want to dehex."}
]);

function printUsage () {
	var usage = cli.getUsage({
		title: "A858 Decrypter",
		description: "Decrypts A858 posts based on a key list and cipher modes.",
		footer: "Project home: [underline]{https://github.com/TomCaserta/A858Decrypter} ReadMe: [underline]{https://github.com/TomCaserta/A858Decrypter/README.MD}"
	});
	console.log(usage);
}

var commands;
try {
 commands = cli.parse();
}
catch (e) {
	console.log(e);
	printUsage();
}

if (commands.hasOwnProperty("help")) {
	printUsage();
	return;
}

var specifiedTransformers = commands["key-transform"];
for (var transformIndex = 0; transformIndex < specifiedTransformers.length; transformIndex++) {
	var cTransform = specifiedTransformers[transformIndex];
	if (!KeyTransformer.hasTransform(cTransform)) {
		console.log("Invalid key transformer ("+cTransform+"), valid transforms are: "+KeyTransformer.getTransforms().join(", "));
		printUsage();
		return;
	}
}

var preProcessors = commands["preprocessor"];
for (var pIndex = 0; pIndex < preProcessors.length; pIndex++) {
	var pProcessor = preProcessors[pIndex];
	PostPreprocessor.addProcessor(pProcessors);
}

if (commands["all-ciphers"] == true) {
	modes = potentialCiphers;
}
else {
	var m = commands["modes"];
	// Push the modes on to the mode list
	for (var modeIndex = 0; modeIndex < m.length; modeIndex++) {
		var cip =m[modeIndex];
		if (potentialCiphers.indexOf(cip) != -1) {
			modes.push(cip);
		}
		else {
			console.log("Invalid cipher ("+cip+"), valid ciphers are: "+potentialCiphers.join(", "));
			printUsage();
			return;
		}
	}
}

fs.createReadStream(commands["in-file"]).pipe(csv({
	headers: ["title", "time", "body", "url"]
})).on("data", function (row) { 
	posts.push(Post.fromCSV(row));
	log("Loading posts: "+posts.getLength());
}).on("end", function () { 
	log(posts.getLength() +" posts loaded into decrypter.");
	console.log(""); // Progress bar encrouches on to previous line without this.
	posts.preprocess();
	readKeyData().then(processKeys, function (err) { 
		console.error(err);
	}).then(function (keys) { 
		decryptPosts(posts, keys, modes);
	}, function (err) { 
		console.error(err);
	});
});

function decryptPosts (posts, keys, modes) {	
	var decrypter = new Decrypter(posts, keys, modes, 8);
	console.log("Decrypting "+posts.getLength()+" posts with "+keys.getLength()+" keys and the following modes: "+modes.join(", ")+". Totalling "+decrypter.getProcessAmount()+" operations (hex encoded posts only) \n")
	try {
		if (decrypter.getProcessAmount() > 50000) {
			console.log("You have opted to do bulk operations. This may take a while before the progress bar moves...")
		}
		var progress = Utils.createProgressBar("Decrypting Data: ", decrypter.getProcessAmount());
		progress.tick(0);
		decrypter.decrypt();
		var success = [];
		var fail = [];
		decrypter.on("decrypt", function (data) {
			data.decryptionResult = new Buffer(data.decryptionResult, "hex");
			data.score = Utils.scoreRelevance(data.decryptionResult);
			success.push(data);
			progress.tick(1);
		});

		decrypter.on("error", function (err) { 
			fail.push(err.post);
			progress.tick(1);
		});

		decrypter.on("done", function () {
			console.log("\nFinished",success.length,"decrypted succesfully",fail.length,"decryption errors.");

			outputSuccesful(success);

		});

	}
	catch (e) {
		console.error(e);
	}
}

function outputSuccesful (success) {
	try {
		var sortFn = function (pa, pb) {
			return pa.score - pb.score;
		};
		var successSorted = success.sort(sortFn);
		var ASCII = [];
		var UNICODE = [];
		successSorted.forEach(function (decData) { 
			var asci = decData.decryptionResult.toString("ascii");
			var uni = decData.decryptionResult.toString("utf8");
			if (asci == uni) {
				ASCII.push(decData);
			}
			else {
				UNICODE.push(decData);
			}
		});
		var mappedRes = ASCII.map(function (decData) { 
			return "#"+decData.post.name+"\n\nLink: "+decData.post.url+"\n\n Score: "+decData.score+"\n\n Std Devs: "+Utils.getStandardDeviation(decData.decryptionResult)+"\n\n Key: "+decData.key.key +" \n\n Final Block: "+decData.post.body.substr(decData.post.body.length - 16, decData.post.body.length)+"\n\nIV: "+decData.key.iv+"\n\n #Decoded String\n\n    "+decData.decryptionResult.toString("ascii").split("\n").join("\n    ");
		});
		var unicodeRes = UNICODE.map(function (decData) { 
			return "#"+decData.post.name+"\n\nLink: "+decData.post.url+"\n\n Key: "+decData.key.key +" IV: "+decData.key.iv+"\n\n #Decoded String\n\n    "+decData.decryptionResult.toString("utf8").split("\n").join("\n    ");
		});
		fs.writeFileSync(commands["out-ascii"], mappedRes.join("\n\n"));
		fs.writeFileSync(commands["out-unicode"], unicodeRes.join("\n\n"),0,"utf8");
		var csvFile = "";
		for (var i = 0; i<ASCII.length; i++) {
			var decData = ASCII[i];
			var out = decData.decryptionResult.toString("ascii");
			if (Utils.isHex(out)) { 
				csvFile += decData.post.name+",0,"+out+","+decData.post.url+"\n";
			}
		}
		fs.writeFileSync(commands["out-csv"], csvFile);
	}
	catch (e) {
		console.error("Error here" ,e);
		console.error(e.stack);
	}
}

function readKeyData() {
	//console.log("Reading key data");
	return Utils.readFileWithProgress(commands["key-file"], "Reading Key Data: ");
}
function processKeys (keyData) {
	//console.log("Reading process keys");
	var keyLines = keyData.split("\n"); //
	var progress = Utils.createProgressBar("Processing keys: ", keyLines.length);
	for (var kIn = 0; kIn < keyLines.length; kIn++) {
		var keyLine = keyLines[kIn];
		var key = Key.fromText(keyLine, commands["iv-seperator"]);
		keys.push(key);
		progress.tick(1);
	}
	keys.transform(specifiedTransformers);
	return keys;
}


