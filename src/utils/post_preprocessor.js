var Post = require("../models/post.js");

function PostPreprocessor() {
	throw "PostPreprocessor should be called statically";
}

/**
 * List of preprocessors
 * @type {Array}
 */
PostPreprocessor._PREPROCESSORS = [];

/**
 * Adds a processor from a file
 * @param  {string}
 * @return {null}
 */
PostPreprocessor.importProcessor = function (processorFile) {
	PostPreprocessor._PREPROCESSORS.push({name: processorFile, func: require(processorFile)});
}

/**
 * Adds a processor from a name and function
 * @param {string}
 * @param {function}
 */
PostPreprocessor.addProcessor = function (name, processFunction) {
	PostPreprocessor._PREPROCESSORS.push({name: name, func: processFunction});
}

/**
 * Passes a post through the preprocessor list.
 * @param  {Post} The post to preprocess
 * @param  {Array} Processor list to use
 * @param  {DecrypterAPI} Decrypter API to pass through to the processor
 * @return {Post} 
 */
PostPreprocessor.preprocess = function (post, processorList, decrypterAPI) {
	var pp = PostPreprocessor._PREPROCESSORS;
	for (var i = 0; i < pp.length; i++) {
		var processor = pp[i];
		if (processorList.indexOf(processor.name) != -1) {
			processor.func(post, decrypterAPI);
		}
	}
	return post;
}

module.exports = PostPreprocessor;