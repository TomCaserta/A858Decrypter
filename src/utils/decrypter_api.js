function DecrypterAPI (postList, keyList) {
	 this.postList = postList;
	 this.keyList = keyList;
}

DecrypterAPI.prototype.addKey = function (key) {
	this.keyList.push(key);
};

DecrypterAPI.prototype.addPost = function (post) {
	this.postList.push(post);
};

module.exports = DecrypterAPI;