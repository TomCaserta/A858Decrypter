var KeyTransformer = require("../utils/key_transformer.js");

/**
 * Creates a new Key instance
 * @param {string} String representation of key
 * @param {string} String representation of the IV
 */
function Key (key, iv) {
	this._originalKey = key;
	this.key = key;
	this.iv = iv;
}

/**
 * Creates a new key from the text and ivSeparator used. 
 * @param  {string} The text containing the key and IV
 * @param  {string} The text that separates the IV
 * @return {Key} The new key object
 */
Key.fromText = function (text, ivSeparator) {
	// Split our text into key and iv
	var keySplit = text.split(ivSeparator);

	// If the amount of separators is greater than 2, something may have gone wrong.
	if (keySplit.length > 2) {
		throw "Key Text: "+text+" has more than two instances of separator "+ivSeparator+" this implies that the separator supplied is invalid";
	}

	// Take the first string as the key
	var key = keySplit[0];
	var iv = null;

	// If our line contains an iv, set it to the second param
	if (keySplit.length == 2) {
		iv = keySplit[1];
	}

	return new Key(key, iv);
};

/**
 * Returns the key before it was transformed
 * @return {string} The original key
 */
Key.prototype.getOriginalKey = function () {
	return this._originalKey;
};

/**
 * Transforms the key and returns the new key
 * @param  {array} An array of key transforms to be performed.
 * @param  {boolean} Defaults to false, decides whether the key transform should be performed on the original key or current key.
 * @return {string} The new transformed key
 */
Key.prototype.transform = function (transformList, transformCurrentKey) {
	this.key = KeyTransformer.transformKey(transformCurrentKey ? this.key : this.getOriginalKey(), transformList);
	return this.key;
};

module.exports = Key;