#!/bin/bash

cwd=$(pwd)

composer card delete -n admin@rotterdam_logistics_blocklab

cd ~/fabric-tools
./stopFabric.sh
./teardownFabric.sh
sudo ./startFabric.sh
./createPeerAdminCard.sh

cd $cwd    

composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName rotterdam_logistics_blocklab
composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile rotterdam_logistics_blocklab@0.0.1.bna --file networkadmin.card
composer card import --file networkadmin.card
composer network ping --card admin@rotterdam_logistics_blocklab