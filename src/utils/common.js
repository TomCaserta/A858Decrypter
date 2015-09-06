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

Utils.scoreRelevance = function (hex) {
	if (!hex instanceof Buffer) {

	}
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