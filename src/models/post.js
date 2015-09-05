var Utils = require("../utils/common.js");

/**
 * Creates a new post object
 * @param {string} Title of the post
 * @param {int} Time of the post
 * @param {string} Post body in ASCII format
 * @param {string} URL of the post
 */
function Post (name, time, body, url) {
	this.name = name;
	this.time = time;
	this.body = this._sanitizeBody(body);
	this.url = url;
}

/**
 * Alias for Post.fromCSV
 * @type {function}
 */
Post.fromObject = Post.fromCSV;

/**
 * Creates a new Post object with the CSV data passed
 * @param  {object or array} The CSV data to create a new post from
 * @return {Post}
 */
Post.fromCSV = function (csvData) {
	// If our csv data is in a array format then we should parse it
	// as though the headers are [title, time, body, url]
	if (csvData instanceof Array) {
	    csvData = {
			title: csvData[0],
			time: csvData[1],
			body: csvData[2],
			url: csvData[3]
		};
	}	
	return new Post(csvData.name, csvData.time, csvData.body, csvData.url);
};

/**
 * Returns true if the body of the post is hex
 * @return {Boolean} 
 */
Post.prototype.isHex = function () {
	return Utils.isHex(this.body);
};

/**
 * Preprocess the post, modifies the post object/data and returns itself.
 * @param  {Array} List of named preprocessors to use
 * @param  {DecrypterAPI} Decrypter API specific to the current decrypter session
 * @return {Post} 
 */
Post.prototype.preprocess = function (preProcessors, decrypterAPI) {
	return PostPreprocessor.preprocess(this, preProcessors, decrypterAPI);
};

/**
 * Returns the Standard Deviation of the post body
 * @return {number}
 */
Post.prototype.getStandardDeviation = function () {
	// If the body is hex then we should decode the hex as bytes
	if (this.isHex()) {
		return Utils.getStandardDeviation(new Buffer(this.body, "hex");
	}

	// If not just use the utf8 representation
	return Utils.getStandardDeviation(new Buffer(this.body, "utf8"));
};

module.exports = Post;