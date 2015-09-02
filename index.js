var assert = require('assert');
var Transform = require('stream').Transform;
var util = require('util');
var sprintf = require("sprintf-js").sprintf;

function Hexdump(options) {
  Transform.call(this, options);
  this.offset = new Buffer(0);
  this.lines = 0;
  this.prevLine = new Buffer(0);
  this.isRepeating = true;
}

util.inherits(Hexdump, Transform);

Hexdump.prototype._processLine = function (buffer) {
  // TODO is this pushing too frequently? Is buffering a better idea?
  if (buffer.length === 0) {
    return;
  }
  if (this.prevLine.compare(buffer) === 0) {
    this.lines += 16;
    if (!this.isRepeating) {
      this.push('*\n');
      this.isRepeating = true;
    }
    return;
  }
  this.isRepeating = false;
  this.push(sprintf("%08x  ", this.lines));

  var c;
  var len = buffer.length;
  for (c = 0; c < 8; c++) {
    if (c < len) {
      this.push(sprintf("%02x ", buffer[c]));
    } else {
      this.push('   ');
    }
  }

  this.push(' ');

  for (c = 8; c < 16; c++) {
    if(c < len) {
      this.push(sprintf('%02x ', buffer[c]));
    } else {
      this.push('   ');
    }
  }

  this.push(' ');

  if (len > 0) {
  this.push('|');

  // ASCII Dump
  for (c = 0; c < 16 ; c++) {
    if (c<len) {
      if (buffer[c] >= 32 && buffer[c] < 127) {
        this.push(sprintf("%c", buffer[c]));
      } else {
        this.push('.'); // non-printable
      }
      this.lines++;
    } else {
      break;
    }
  }
  this.push('|');
  }
  this.push('\n');
  this.prevLine = buffer;
};

Hexdump.prototype._endLine = function () {
  if (this.lines) {
    this.push(sprintf("%08x\n", this.lines));
  }
};

Hexdump.prototype._transform = function (chunk, encoding, callback) {
  // Convert to Buffer (if is not already)
  if (!Buffer.isBuffer(chunk)) {
    // TODO is this right?
    chunk = new Buffer(chunk, encoding);
  }

  var offsetLen = (this.offset && this.offset.length) || 0;

  this.offset = Buffer.concat([this.offset, chunk.slice(0, 16 - offsetLen)]);

  if (this.offset.length < 16) {
    return callback();
  }

  this._processLine(this.offset);

  this.offset = new Buffer(0);

  var lines = (chunk.length / 16) | 0;
  var i;

  for (i = 1; i < lines; i++) {
    // TODO a more performant way of achieving this?
    this._processLine(chunk.slice((16 - offsetLen) * i, (16 - offsetLen) * (i+1)));
  }

  var offset = chunk.length - (16 - offsetLen) * lines;

  if (lines > 0) {
    if (offset !== 0) {
      this.offset = chunk.slice((16 - offsetLen) * lines, chunk.length);
    }
  }

  callback();
};

Hexdump.prototype._flush = function (callback) {
  if (this.offset) {
    this._processLine(this.offset);
  }
  this._endLine();
  callback();
};

module.exports = Hexdump;
