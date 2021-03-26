#!/bin/bash
if [ "$1" == "start" ]; then
    echo "*********************************"
    echo "      Generating Artifacts       "
    echo "*********************************"
    ./charcoal-network/scripts/generate.sh
    echo "*********************************"
    echo "      Starting Network           "
    echo "*********************************"
    ./charcoal-network/scripts/start.sh
    echo "*********************************"
    echo "      Installing Chaincode       "
    echo "*********************************"
    ./charcoal-network/scripts/install-cc.sh
    echo "*********************************"
    echo "      Registering Users          "
    echo "*********************************"
    ./charcoal-network/scripts/register-users.sh
elif [ "$1" == "stop" ]; then
    ./charcoal-network/scripts/stop.sh
elif [ "$1" == "install" ]; then
    cd ./chaincode
    npm install
    cd ..
    npm install
fi