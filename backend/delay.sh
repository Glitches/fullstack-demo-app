#!/bin/bash
while :
do
  if ping -c 1 fullstack-db:3306 &> /dev/null
  then
    echo "Host is online"
    sleep 20s
    node src/index.js
    break
  fi
  sleep 10 s
done
