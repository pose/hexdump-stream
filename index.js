var assert = require('assert');
var Transform = require('stream').Transform;
var util = require('util');
var sprintf = require("sprintf-js").sprintf;

function Hexdump(options) {
  Transform.call(this, options);
  this.offset = new Buffer(0);
  this.lines = 0;
  this.prevLine = {buffer: new Buffer(0), start: 0, end: 0};
  this.isRepeating = true;
}

util.inherits(Hexdump, Transform);

function compare(buffer1, start1, end1, prevLine) {
  var i;

  for (i = 0; i < Math.max(end1 - start1, prevLine.end - prevLine.start); i++) {
    if (buffer1[start1 + i] != prevLine.buffer[prevLine.start + i]) {
      return 1;
    }
  }

  return 0;
}

Hexdump.prototype._processLine = function (buffer, start, end) {
  // TODO is this pushing too frequently? Is buffering a better idea?
  if (end - start === 0) {
    return;
  }
  if (compare(buffer, start, end, this.prevLine) === 0) {
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
  var len = end - start;
  for (c = 0; c < 8; c++) {
    if (c < len) {
      this.push(sprintf("%02x ", buffer[start + c]));
    } else {
      this.push('   ');
    }
  }

  this.push(' ');

  for (c = 8; c < 16; c++) {
    if(c < len) {
      this.push(sprintf('%02x ', buffer[start + c]));
    } else {
      this.push('   ');
    }
  }

  this.push(' ');

  if (len > 0) {
  this.push('|');

  // ASCII Dump
  for (c = 0; c < 16; c++) {
    if (c<len) {
      if (buffer[start + c] >= 32 && buffer[start + c] < 127) {
        this.push(sprintf("%c", buffer[start + c]));
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
  this.prevLine = {buffer: buffer, start: start, end: end};
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

  this._processLine(this.offset, 0, 16);

  this.offset = new Buffer(0);

  var lines = (chunk.length / 16) | 0;
  var i;

  for (i = 1; i < lines; i++) {
    // TODO a more performant way of achieving this?
    // this._processLine(chunk.slice((16 - offsetLen) * i, (16 - offsetLen) * (i+1)));
    this._processLine(chunk,(16 - offsetLen) * i, (16 - offsetLen) * (i+1));
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
    this._processLine(this.offset, 0, this.offset.length);
  }
  this._endLine();
  callback();
};

module.exports = Hexdump;
