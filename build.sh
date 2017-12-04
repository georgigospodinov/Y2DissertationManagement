#!/bin/bash

if [ ! -x node_modules ]
then
  echo "Installing Dependencies"
  npm link express validator mocha chai body-parser basic-auth
fi

mocha test/unit/*.js

