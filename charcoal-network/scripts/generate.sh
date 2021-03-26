#!/bin/bash
export IMAGE_TAG=latest
echo "Generating cryto material for peers..."
[ -d ./charcoal-network/channel-artifacts ] || mkdir ./charcoal-network/channel-artifacts

../bin/cryptogen generate --config=./charcoal-network/crypto-config.yaml --output="./charcoal-network/crypto-config"

[ -d ./charcoal-network/crypto-config ] || mkdir ./charcoal-network/crypto-config

echo "Generating channel artifacts and genesis block..."
../bin/configtxgen -configPath ./charcoal-network -profile AuditOrdererGenesis -outputBlock ./charcoal-network/channel-artifacts/genesis.block
../bin/configtxgen -configPath ./charcoal-network -profile AuditChannel -outputCreateChannelTx ./charcoal-network/channel-artifacts/channel.tx -channelID mychannel

CURRENT_DIR=$PWD
cd ./charcoal-network/base
cp docker-compose-base-template.yaml docker-compose-base.yaml
OPTS="-i"
cd $CURRENT_DIR
cd ./charcoal-network/crypto-config/peerOrganizations/certifiedCompanies.example.com/ca
PRIV_KEY=$(ls *_sk)
cd $CURRENT_DIR
cd ./charcoal-network/base
sed $OPTS "s/CA1_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-base.yaml

cd $CURRENT_DIR
cd ./charcoal-network/crypto-config/peerOrganizations/certifiers.example.com/ca
PRIV_KEY=$(ls *_sk)
cd $CURRENT_DIR
cd ./charcoal-network/base
sed $OPTS "s/CA2_PRIVATE_KEY/${PRIV_KEY}/g" docker-compose-base.yaml

cd $CURRENT_DIR
./charcoal-network/scripts/generate-ccp.sh