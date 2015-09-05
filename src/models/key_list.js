/**
 * Creates a new key list
 */
function KeyList () {
	this._keys = [];
}

/**
 * Adds a Key object into the Key list.
 * @param  {Key}
 * @return {null}
 */
KeyList.prototype.push = function (key) {
	this._keys.push(key);
};

/** 
 * Returns the length of the KeyList
 * @return {integer}
 */
KeyList.prototype.getLength = function () {
	return this._keys.length;
};

/**
 * Gets the Key object from the KeyList
 * @param  {integer}
 * @return {Key}
 */
KeyList.prototype.get = function (i) {
	return this._keys[i];
}

/**
 * Loops through the KeyList objects and calls the callback with the current
 * Key 
 * @param  {Function}
 * @return {null}
 */
KeyList.prototype.forEach = function (callback) {
	for (var pi = 0; pi < this.getLength(); pi++) {
		callback(this.get(i), i);
	}	
};

/** 
 * Transforms the KeyList Key objects
 * @param {Array} The transforms to run on the KeyList
 * @return {null}
 */
KeyList.prototype.transform = function (transformers) {
	this.forEach(function (key){ 
		key.transform(transformers);
	});
};
