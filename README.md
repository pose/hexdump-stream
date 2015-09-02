A hexdump stream for Node.js.

## Install

```sh
npm install --save hexdump-stream
```

## Usage

```js
var Hexdump = require('hexdump-stream');

var stream = new Hexdump();

process.stdin.pipe(stream).pipe(process.stdout);

```
Example:

```
> $ echo 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce \
    feugiat eu nisi sed pellentesque' | node index.js

00000000  4c 6f 72 65 6d 20 69 70  73 75 6d 20 64 6f 6c 6f  |Lorem ipsum dolo|
00000010  72 20 73 69 74 20 61 6d  65 74 2c 20 63 6f 6e 73  |r sit amet, cons|
00000020  65 63 74 65 74 75 72 20  61 64 69 70 69 73 63 69  |ectetur adipisci|
00000030  6e 67 20 65 6c 69 74 2e  20 46 75 73 63 65 20 66  |ng elit. Fusce f|
00000040  65 75 67 69 61 74 20 65  75 20 6e 69 73 69 20 73  |eugiat eu nisi s|
00000050  65 64 20 70 65 6c 6c 65  6e 74 65 73 71 75 65 0a  |ed pellentesque.|
00000060
```

## Compatibility

The output is meant to be exactly the same as doing `hexdump -C` to the input stream.

## Other alternatives

- [hexer][hexer]
- [hexy][hexy]


[hexer]:  https://github.com/jcorbin/hexer
[hexy]:   https://github.com/a2800276/hexy.js
