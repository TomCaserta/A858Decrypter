var crypto = require("crypto");
var events = require('events');
var Threader = require('./utils/threader.js');
var util   = require('util');
//var Parallel = require("paralleljs");

/**
 * Creates a new Decrypter instance that can be used to
 * mass decrypt large amounts of data.
 * 
 * @param {KeyList} The key list to use to decrypt
 * @param {PostList} The posts that should be decrypted
 * @param {array} The cipher modes to use for decryption
 */
function Decrypter (posts, keys, modes, workers) {
  	events.EventEmitter.call(this);
  	// TODO: Make immutable.
	this.keys = keys;
	this.posts = posts;
	this.modes = modes;
	this.threader = new Threader(workers, "./src/workers/decrypt.js");

	// Private vars!
	this._amountToProcess = 0;
	this._isDecrypting = false;
	this._amountDecrypted = 0;
}

util.inherits(Decrypter, events.EventEmitter);

/**
 * Calculates the amount of decryptions needed to process
 * a key and document list and then sets the internal 
 * process amount.
 * 
 * @return {int} The amount of decryptions to process
 */
Decrypter.prototype._calculateProcessAmount = function () {
	console.log(this.keys.getLength());
	console.log(this.posts.getHexLength());
	console.log(this.modes.length);
	this._amountToProcess = (this.posts.getHexLength() * this.keys.getLength()) * this.modes.length;
	console.log(this._amountToProcess);
	return this._amountToProcess;
};

/**
 * Gets the amount of decryptions needed to be processed.
 * @return {int}
 */
Decrypter.prototype.getProcessAmount = function () {
	return this._calculateProcessAmount();
};

/**
 * Starts the decryption process. 
 * @return {Decrypter}
 */
Decrypter.prototype.decrypt = function () {
	if (this._isDecrypting == false) {
		// Emit our start event to let listeners know that decryption has started
		this.emit("start");

		this._reset(); // Just in case

		this.threader.startUp();

		// Lock the decrypt event to ensure you cant attempt to paralell decrypt
		// with the same object
		this._isDecrypting = true; 

		// Calculate the process amount as to know when decryption is finished
		this._calculateProcessAmount();

		// Loop through posts to decrypt
		var self = this;
		this.posts.forEach(function (post) {
			if (post.isHex()) {
				self._decryptPostWithKeys(post, self.keys, self.modes);
			}
		});
	}
	else {
		throw new Exception("Error: Already processing a previous decryption");
	}
	return this;
};

/**
 * Decrypts a post using a supplied key list.
 * 
 * @param  {Post} The post object to decrypt
 * @param  {KeyList} An array of key objects to use
 * @return {null}
 */
Decrypter.prototype._decryptPostWithKeys = function (post, keys, modes) {
	// Keys loop
	var self = this;
	this.keys.forEach(function (key) { 
		self._decryptPostWithModes(post, key, modes);
	});
};

/**
 * Decrypts a post using a mode cipher list against
 * the specified post and key
 *
 * @param  {Post} The post object to decrypt
 * @param  {Key} The key object to use
 * @param  {array} An array of modes to decrypt using
 * @return {null}
 */
Decrypter.prototype._decryptPostWithModes = function (post, key, modes) {
	// Modes loop
	for (var modeN = 0; modeN < this.modes.length; modeN++) {
		var currentMode = this.modes[modeN];
		this._decryptPost(post, key, currentMode);
	}
};

/**
 * Resets the Decrypter so as to be able to start
 * another decryption.
 * @return {null}
 */
Decrypter.prototype._reset = function () {
	// Reset our object back to its original state
	this._amountToProcess = 0;
	this._isDecrypting = false;
	this._amountDecrypted = 0;
};

/**
 * Checks if posts have been decrypted, will emit a done
 * event and reset the object if it has.
 * 
 * @return {boolean} If the decryption has finished
 */
Decrypter.prototype._checkIfAllDecrypted = function () {
	// Check if the decryption has finished
	//console.log(this._amountDecrypted , this._amountToProcess);
	if (this._amountDecrypted == this._amountToProcess) {
		// Emit our done event and reset.
		this.emit("done");
		this.threader.disconnectAll();
		//this.removeAllListeners();
		this._reset();
		return true;
	}
	return false;
};

/**
 * Decrypts a post using the specified parameters
 * emits a data event once decryption has finished.
 * 
 * @param  {Post} The post object to decrypt
 * @param  {Key} The key object to use for decryption
 * @param  {string} The cipher mode to use for decryption
 * @return {null}
 */
Decrypter.prototype._decryptPost = function (post, key, mode) {
	// Actual Decryption
	if (post.isHex()) { // Final check before we send it to the decrypter
		var work = {
			task: "decrypt",
			buffer: new Buffer(post.body,"hex"),
			key: key,
			algorithm: mode
		};
		var self = this;
		this.threader.sendWork(work).then(function (decryptedResponse) { 
			self._amountDecrypted++;
			self.emit("decrypt", {post: post, decryptionResult: decryptedResponse.result });
			self._checkIfAllDecrypted();
		}, function (err) {
			self._amountDecrypted++;
			self.emit("error", { post: post, message: err.result });
			self._checkIfAllDecrypted();
		});
	}
	else {
		throw "Post is not hex encoded";
	}
};

module.exports = Decrypter;