#!/bin/bash
export IMAGE_TAG=1.4.3

echo "Creating containers... "

# TODO This approach is hacky; instead, identify where hyperledger/fabric-ccenv is pulled and update the tag to 1.4.3
docker pull hyperledger/fabric-ccenv:1.4.3
docker tag hyperledger/fabric-ccenv:1.4.3 hyperledger/fabric-ccenv:latest

docker-compose -f ./charcoal-network/docker-compose-cli.yaml -f ./charcoal-network/docker-compose-couch.yaml up -d

sleep 5

echo 
echo "Containers started" 
echo 
docker ps
echo

#Joining CertifiedCompanies
echo "Creating Channel and join CertifiedCompanies"
docker exec -it cli ./scripts/channel/createChannel.sh

#Joining Certifiers
docker exec -it cli ./scripts/channel/join-peer.sh peer0 certifiers CertifiersMSP 8051 1.0


