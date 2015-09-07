var events = require("events");
var childprocess = require("child_process");
var fork = childprocess.fork;
var Promise = require("promise");

function Threader (workers, module) {
  	events.EventEmitter.call(this);
  	this.workers = workers;
  	this.module = module;
  	this._workerIndex = 0;
  	this._isConnected = false;
  	this._threads = [];
  	this._identifierIndex = 0;
  	this._workerPromiseHashmap = {};
  	// Bind this to message handler
  	this._messageHandler = this.__messageHandler.bind(this);
};

/** 
 * Starts up the Child Processes
 * @return {null}
 */
Threader.prototype.startUp = function () {
	for (var i = 0; i < this.workers;  i++) {
		var forked = fork(this.module);
		forked.on("message", this._messageHandler);
		this._threads.push(forked);
	}
	this._isConnected = true;
};

Threader.prototype.__messageHandler = function (message) {
	var identifier = message.identifier;
	var prom = this._workerPromiseHashmap[identifier];
	if (message.success) {
		prom.resolve(message);
	}
	else {
		prom.reject(message);
	}
};

/**
 * Increments the current worker counter
 * @return {null}
 */
Threader.prototype._nextWorker = function () {
	this._workerIndex++;
	if (this._workerIndex >= this._threads.length) {
		this._workerIndex = 0;
	}
}

/**
 * Gets the current worker
 * @return {ChildProcess}
 */
Threader.prototype._currentWorker = function () {
	return this._threads[this._workerIndex];
}

/**
 * Distributes a task to a worker
 * @return {Promise}
 */
Threader.prototype.sendWork = function (work) {
	if (!this._isConnected) {
		throw "Threader is not currently connected to any processes";
	}
	work.identifier = this._identifierIndex;
	// Increment the worker index
	this._nextWorker();
	var cW = this._currentWorker();

	this._identifierIndex++;
	var self = this;
	return new Promise(function (resolve, reject) { 
		self._workerPromiseHashmap[work.identifier] = { resolve: resolve, reject: reject};
		cW.send(work);
	});
};

/**
 * Disconnects all threads
 * @return {null}
 */
Threader.prototype.disconnectAll = function () {
	this._connected = false;
	for (var thread = 0; thread < this._threads.length; thread++) {
		this._threads[thread].disconnect();
	}
};

module.exports = Threader;
