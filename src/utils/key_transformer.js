function KeyTransformer () {
	throw "KeyTransformer should be called statically";
}

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

KeyTransformer.transformKey = function (key, transformationType) {
	if (typeof transformationType != "object") {
		transformationType = [transformationType];
	}
	var currkey = key;
	for (var x = 0; x < transformationType.length; x++) {
		var transType = transformationType[x];
		currkey =  KeyTransformer.transforms[transType](currkey);
	}
	return currkey;
};

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