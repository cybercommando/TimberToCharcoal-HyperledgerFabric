#!/bin/bash

export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

export COMPOSE_PROJECT_NAME=charcoalnetwork

peer chaincode instantiate -o orderer.example.com:7050 --tls true --cafile $ORDERER_CA -C mychannel -l node -n charcoalcc -v 1.0 -c '{"Args":[]}' -P "OR ('CertifiersMSP.peer','CertifiedCompaniesMSP.peer','TestOrgMSP.peer')" >&log.txt

cat log.txt