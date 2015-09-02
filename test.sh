#!/usr/bin/env sh

set -e

alias hd="node cli.js"


hexdump -C  < /bin/ls             > expected
hd          < /bin/ls             > actual

diff expected actual

echo 'hi' | hexdump -C            > expected
echo 'hi' | hd                    > actual

diff expected actual

echo 'hi   ' | hexdump -C         > expected
echo 'hi   ' | hd                 > actual

diff expected actual

echo 'hello how are you? :D' | hexdump -C > expected
echo 'hello how are you? :D' | hd         > actual

diff expected actual

hexdump -C    < /dev/null     > expected
hd            < /dev/null     > actual

diff expected actual

for i in $(seq 1 52); do
  dd if=/dev/zero bs="$i" count=1 of=sample 2> /dev/null
  hexdump -C  < sample    > expected
  hd          < sample    > actual

  diff expected actual
done

for i in $(seq 1 52); do
  dd if=/dev/urandom bs="$i" count=1 of=sample 2> /dev/null
  hexdump -C  < sample    > expected
  hd          < sample    > actual

  diff expected actual
done

for i in $(seq 1 300); do echo -n "$(date +%S)"; done > sample

  hexdump -C  < sample    > expected
  hd          < sample    > actual

  diff expected actual

 echo 'All tests passed.'

 # cleanup
 rm sample expected actual
