#!/bin/bash

echo "Installing chaincode for CertifiedCompanies..."
docker exec -it cli ./scripts/install-cc/install-peer.sh peer0 certifiedCompanies CertifiedCompaniesMSP 7051 1.0

echo "Installing chaincode for Certifiers..."
docker exec -it cli ./scripts/install-cc/install-peer.sh peer0 certifiers CertifiersMSP 8051 1.0

echo "Installing chaincode for TestOrg..."
docker exec -it cli ./scripts/install-cc/install-peer.sh peer0 testOrg TestOrgMSP 9051 1.0

echo "Instanciating the chaincode..."
docker exec -it cli ./scripts/install-cc/instanciate.sh

docker ps