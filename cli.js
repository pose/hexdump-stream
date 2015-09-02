#!/usr/bin/env node

var Hexdump = require('./index');

var hexdump = new Hexdump();

process.stdin
  .pipe(hexdump)
  .pipe(process.stdout);

