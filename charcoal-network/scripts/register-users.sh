#!/bin/bash
node src/enrollAdmin.js certifiedCompanies
node src/enrollAdmin.js certifiers

node src/registerUser.js certifiedCompanies
node src/registerUser.js certifiers

echo "***********************************"
echo "       Starting API Server         "
echo "***********************************"
npm start