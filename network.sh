#!/bin/bash
if [ "$1" == "start" ]; then
    echo "*********************************"
    echo "      Generating artifacts       "
    echo "*********************************"
    ./charcoal-network/scripts/generate.sh
    echo "*********************************"
    echo "        Starting network         "
    echo "*********************************"
    ./charcoal-network/scripts/start.sh
elif [ "$1" == "stop" ]; then
    ./charcoal-network/scripts/stop.sh
elif [ "$1" == "install" ]; then
    cd ./chaincode
    npm install
    cd ..
    npm install
fi