#!/bin/bash
export IMAGE_TAG=latest
echo "Generating cryto material for peers..."
[ -d ./charcoal-network/channel-artifacts ] || mkdir ./charcoal-network/channel-artifacts

../bin/cryptogen generate --config=./charcoal-network/crypto-config.yaml --output="./charcoal-network/crypto-config"

[ -d ./charcoal-network/crypto-config ] || mkdir ./charcoal-network/crypto-config

echo "Generating channel artifacts and genesis block..."
../bin/configtxgen -configPath ./charcoal-network -profile AuditOrdererGenesis -outputBlock ./charcoal-network/channel-artifacts/genesis.block
../bin/configtxgen -configPath ./charcoal-network -profile AuditChannel -outputCreateChannelTx ./charcoal-network/channel-artifacts/channel.tx -channelID SupplyChannel

