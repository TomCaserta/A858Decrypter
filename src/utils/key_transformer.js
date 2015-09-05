var crypto = require("crypto");

function KeyTransformer () {
	throw "KeyTransformer should be called statically";
}

/**
 * Transformation object that holds the available transformations
 * @type {Object}
 */
KeyTransformer.transforms = {
	"none": function (key) {
		return key;
	},
	"dehex": function (key) {
		return new Buffer(key, "hex");
	},
	"enhex": function (key) {
		return new Buffer(key, "ascii").toString("hex");
	},
	"string": function (key) {
		return key.toString();
	},
	"uppercase": function (key) {
		return key.toString().toUpperCase();
	},
	"lowercase": function (key) {
		return key.toString().toLowerCase();
	}
};

/**
 * Gets the list of available transforms
 * @return {Array}
 */
KeyTransformer.getAvailableTransforms = function () {
	return Object.getKeys(KeyTransformer.transforms);
};

/**
 * Transforms the key using the specified key transforms.
 * @param  {String} The key to transform 	
 * @param  {Array}
 * @return {String}
 */
KeyTransformer.transformKey = function (key, transformationType) {
	if (!transformationType instanceof Array) {
		transformationType = [transformationType];
	}
	var currkey = key;
	for (var x = 0; x < transformationType.length; x++) {
		var transType = transformationType[x];
		currkey =  KeyTransformer.transforms[transType](currkey);
	}
	return currkey;
};

/**
 * Returns a hex encoded hash of the hashing algorithm
 * @param  {String} The hashing algorithm
 * @param  {String} String to hash
 * @return {String} Hex string representing the hash
 */
function dehash (algo, key) {
	var hasher = crypto.createHash(algo);
	if (key instanceof Buffer) {
		hasher.update(key);
	}	
	else {
		hasher.update(key, "ascii");
	}
	return hasher.digest("hex");
}

var hashAlgos = crypto.getHashes();
hashAlgos.forEach(function (algorithm) { 
	KeyTransformer.transforms[algorithm] = dehash.bind(null, algorithm);
});

module.exports = KeyTransformer;