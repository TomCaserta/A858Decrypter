var ProgressBar = require("progress");
var Promise = require("promise");

function Utils () {
	throw "Utils is a static object";
}

/**
 * Strips new lines, spaces and control feeds from the data.
 * @param  {string} String representation of the data to normalize
 * @return {string} String stripped of any undesired input
 */
Utils.sanitizeData = function (body) {
	return body.replace(/[ \r\n]/g, "");
};

/**
 * Checks if the input data looks like it is hexadecimal encoded
 * @param  {string or Buffer} The input data to test
 * @return {Boolean} 
 */
Utils.isHex = function (hex) {
	if (hex instanceof Buffer) {
		hex = buffer.toString("ascii");
	}
	return /[0-9A-F]/i.test(hex);
};

/**
 * Scores the decrypted response based on a number of factors of
 * which is undefined yet because its not implemented
 * @param  {[type]}
 * @return {[type]}
 */
Utils.scoreRelevance = function (hex) {
	if (!hex instanceof Buffer) {
		// TODO: Score Relevance Function
	}
};

/**
 * Creates a progress bar with commonly required parameters
 * @param  {String} Progress bar name
 * @param  {Integer} Total objects to complete
 * @return {ProgressBar}
 */
Utils.createProgressBar = function (displayName, totalLength) {
	//console.log(displayName, totalLength);
	return new ProgressBar(pad(displayName, 30, " ")+' :bar :etaS ', { 
		total: totalLength,
		complete: "█",
		incomplete: "░",
		width: 80
	});
};

/**
 * Reads a file, outputs a progress bar and buffer
 * @param  {String} The file name
 * @param  {String} The display name of the progress bar
 * @param  {Stream?} Pipes the output to another stream
 * @return {Promise}
 */
Utils.readFileWithProgress = function (fileName, displayName, pipeTo) {
	return new Promise(function (resolve, reject) { 
		//console.log("Promise called");
		statFile(fileName).then(function (fileStats) {
			var size = fileStats["size"];
			//console.log("Reading progress");
			var progressBar = createProgressBar(displayName, size);
			progressBar.tick(0);
			var file = "";
			var readStream = fs.createReadStream(fileName);
			if (pipeTo != null) {
				readStream = readStream.pipe(pipeTo());
			}
			readStream.on("data", function(chunk) {
				progressBar.tick(chunk.length);
				file += chunk;
			}).on("end", function() {
				resolve(file);
			}).on("error", function (error) { 
				reject(error);
			});
		}, function (err) { 
			reject(err);
		});
	});
}

/**
 * Pads the text up to the specified width 
 * @param  {String} Item to padd
 * @param  {Integer} Amount to padd
 * @param  {String} Character to padd with defaults to 0
 * @return {String}
 */
Utils.pad = function (text, width, paddCharacter) {
  paddCharacter = paddCharacter || '0';
  text = text + '';
  return text.length >= width ? text : new Array(width - text.length + 1).join(paddCharacter) + text;
};

/**
 * Creates a histogram from an input, the returned object is charCode => frequency (key=>value)
 * @param  {String or Buffer} The input data to create a histogram for
 * @return {Object} An object displaying how common each character is.
 */
Utils.histogram = function (hex) {	
	if (!hex instanceof Buffer) {
		hex = new Buffer(hex, "ascii");
	}
	var result = {};
	for (var i = 0; i < data.length; i++) {
		var databyte = data[i];
		if (!result.hasOwnProperty(databyte)) {
			result[databyte] = 0;
		}
		result[databyte] += 1
	}
	return result
}

/**
 * Returns the standard deviation in number format.
 * @param  {array or Buffer} The input data to get the standard deviation of
 * @param  {Object?} Optional histogram of the input, if one is not provided, one is created.
 * @return {Number} The standard deviation of the data
 */
Utils.getStandardDeviation = function (hex, histogram) {
	if (!hex instanceof Buffer) {
		hex = new Buffer(hex, "ascii");
	}

	if (histogram == null) {
		histogram = Utils.histogram(hex);
	}

	var n = data.length;
	var p = 1 / 256.0;
	var	expected = n * p;
	var stddev = Math.sqrt(n * p * (1 - p));
	var biggestDiff = 0;
	for (var prop in dist) {
		var d = dist[prop];

		var diff = Math.abs(expected - d);
		if (diff > biggestDiff) {
			biggestDiff = diff;
		}
	}
	var diffStddev;
	if (stddev > 0) {
		diffStddev = biggestDiff / stddev;
	}
	else {
		diffStddev = 0;
	}
	return diffStddev;
}


module.exports = Utils;