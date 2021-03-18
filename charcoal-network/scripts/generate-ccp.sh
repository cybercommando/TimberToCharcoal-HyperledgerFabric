#!/bin/bash
function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ORGMSP}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./connections/ccp-template.json 
}


ORG=certifiedCompanies
ORGMSP=CertifiedCompanies
P0PORT=7051
CAPORT=7054
PEERPEM=./supply-network/crypto-config/peerOrganizations/certifiedCompanies.example.com/tlsca/tlsca.certifiedCompanies.example.com-cert.pem
CAPEM=./supply-network/crypto-config/peerOrganizations/certifiedCompanies.example.com/ca/ca.certifiedCompanies.example.com-cert.pem

echo "$(json_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ./connections/connection-certifiedCompanies.json

ORG=certifiers
ORGMSP=Certifiers
P0PORT=8051
CAPORT=8054
PEERPEM=./supply-network/crypto-config/peerOrganizations/certifiers.example.com/tlsca/tlsca.certifiers.example.com-cert.pem
CAPEM=./supply-network/crypto-config/peerOrganizations/certifiers.example.com/ca/ca.certifiers.example.com-cert.pem

echo "$(json_ccp $ORG $ORGMSP $P0PORT $CAPORT $PEERPEM $CAPEM)" > ./connections/connection-certifiers.json
