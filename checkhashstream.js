var crypto = require('crypto');
var util = require('util');
var Writable = require('stream').Writable;

// Setup logging
// =============

var log = console.log.bind(console);
var debug = console.log.bind(console, 'DEBUG');
var info = console.info.bind(console);
var error = console.error.bind(console);

// Writable stream
// ===============

WS = function (options, oldHash) {
  if (!options || !options.hashAlg || !options.hashDigest || !oldHash)
    throw new Error('options.hashAlg, options.hashDigest and oldHash are mandatory');

  if (!(this instanceof WS)) return new WS(options);

  Writable.call(this, options);

  this.on('finish', function () {
    debug('finish in hashstream');
  });

  this.hash = crypto.createHash(options.hashAlg);
  this.buffer = new Buffer(0);
  this.oldHash = oldHash;
  this.options = options;
  this.newHash = null;
};
util.inherits(WS, Writable);

// update hash with next chunk
WS.prototype._write = function (chunk, enc, next) {
  this.buffer = Buffer.concat([chunk, this.buffer]);
  this.hash.update(chunk.toString());
  this.newHash = null;
  next();
};

// return false if the hashes match and the content otherwise
WS.prototype.get = function () {
  if (!this.newHash)
    this.newHash = this.hash.digest(this.options.hashDigest).toString();

  return {
    match: (this.newHash === this.oldHash),
    newHash: this.newHash,
    oldHash: this.oldHash,
    buffer: this.buffer
  };

};

module.exports = WS;
