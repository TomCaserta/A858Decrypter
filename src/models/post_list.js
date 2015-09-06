/**
 * Creates a new post list
 */
function PostList () {
	this._posts = [];
	this._hexLength = 0;
}

/**
 * Adds a Post object into the post list.
 * @param  {Post}
 * @return {null}
 */
PostList.prototype.push = function (post) {
	this._posts.push(post);
	if (post.isHex()) {
		this._hexLength++;
	}
};

/** 
 * Returns the length of the PostList
 * @return {integer}
 */
PostList.prototype.getLength = function () {
	return this._posts.length;
};

/**
 * Returns the number of posts in this list that is hex
 * @return {integer}
 */
PostList.prototype.getHexLength = function () {
	return this._hexLength;
}

/**
 * Gets the Post object from the PostList
 * @param  {integer}
 * @return {Post}
 */
PostList.prototype.get = function (i) {
	return this._posts[i];
}

/**
 * Loops through the PostList objects and calls the callback with the current
 * Post 
 * @param  {Function}
 * @return {null}
 */
PostList.prototype.forEach = function (callback) {
	for (var pi = 0; pi < this.getLength(); pi++) {
		callback(this.get(i), i);
	}	
};

/** 
 * Preprocesses the PostList post objects
 * @param {Array} The processors to run on the PostList
 * @param {DecrypterAPI} The API to run the processor against
 * @return {null}
 */
PostList.prototype.preprocess = function (preprocessNamesArray, decrypterAPI) {
	this._hexLength = 0;
	var self = this;
	this.forEach(function (post){ 
		post.preprocess(preprocessNamesArray, decrypterAPI);

		// Check if the post is now hex
		if (post.isHex()) {
			self._hexLength++;
		}
	});
};

/**
 * Searches the PostList for posts that match the specified object regex
 * eg. { title: "201202" } will find all posts where the title contains
 * those numbers
 * 
 * @param  {Object} Search object
 * @return {PostList} A new post list containing the found posts.
 */
PostList.prototype.find = function (options) {
	var optsRegex = {
		title: options.title ? new RegExp(options.title, "ig") : null,
		body: options.body ? new RegExp(options.body, "ig") : null
	};
	var posts = new PostList();
	this.forEach(function (post) { 
		var add = true;
		if (optsRegex.title != null) {
			add = optsRegex.title.test(post.title);
		}
		if (optsRegex.body != null) {
			add = optsRegex.body.test(post.body);
		}
		if (add) {
			posts.push(post);
		}
	});
	return posts;
};