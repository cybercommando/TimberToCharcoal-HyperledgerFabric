#!/bin/bash
echo "*********************************"
echo "        Stopping Network         "
echo "*********************************"

docker-compose -f ./charcoal-network/docker-compose-cli.yaml -f ./charcoal-network/docker-compose-couch.yaml down --volumes --remove-orphans
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* q)
rm -r ./charcoal-network/crypto-config
rm -r ./charcoal-network/channel-artifacts
rm -r ./charcoal-network/base/docker-compose-base.yaml
#rm -r ./wallet