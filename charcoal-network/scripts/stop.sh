#!/bin/bash
echo "*********************************"
echo "        Stopping Network         "
echo "*********************************"

docker-compose -f ./charcoal-network/docker-compose-cli.yaml down --volumes --remove-orphans
rm -r ./charcoal-network/crypto-config
rm -r ./charcoal-network/channel-artifacts
rm -r ./charcoal-network/base/docker-compose-base.yaml
rm -r ./wallet