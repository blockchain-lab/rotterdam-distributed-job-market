# Port of Rotterdam Distributed Job Board
Team 12 - Blockchain project repository

The repository is split into three parts: 
 - Hyperledger part that includes chaincode and the node.js restful API, 
 - User interface components 
 - Reports and presentations.

## Hyperledger
The hyperledger part is located in the fabric_network folder. This contains both the restful API and chaincode. Key parts of this folder:
+ **/models/nl.tudelft.blockchain.logistics.cto** - contains general model descriptions for the whole application
+ **/lib/logic.js** - contains the chaincode itself. This is the code that will be run on the blockchain.
+ **/rest_client** - contains the entire restful application. This includes javascript models, services, app.js entrypoint, test initialization classes, routing.

## User Interface

## Reports and presentations
This contains:
 - All of the reports that we have written during the course.
 - Notes we have taken during the meetings
 - Diagrams
 - Presentations

## Installation
In order to run the application locally, and start the development follow these steps (we have developed on linux. Running on windows is possible but you need to figure out the setup yourself):

##### Installing Fabric pre-requisites
Run the following commands:
1. `curl -O https://hyperledger.github.io/composer/prereqs-ubuntu.sh`
2. `chmod u+x prereqs-ubuntu.sh`
3. `./prereqs-ubuntu.sh`

##### Installing Composer
1. Install NVM (node version manager)
   1. `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`
This will git clone & install NVM in ~/.nvm dir, re-open terminal after install and verify installation with `command -v nvm`, should output `nvm`
	(https://github.com/creationix/nvm/blob/master/README.md#installation)
2. Upgrade/Install NPM with NVM 
   1. `nvm install node`
3. Install all the composer npm stuff (note: some packages will start compiling C-code! Don't be scared by strange looking output, it's not running Fabric)
   1. `npm install -g composer-cli@next`
   2. `npm install -g generator-hyperledger-composer@next`
   3. `npm install -g composer-rest-server@next`
4. Install Yeoman, code generation tool
   1. `npm install -g yo`
5. (Optional) Composer Playground, this is basically a site that allows you to create Business Network Defitions from your browser and execute some simple low-level commands such as asset creation. The "test"-area is very much like a SQL Workbench. Having gotten some grips with Composer, I have to say the playground is quite essential to my current dev workflow. The big changes I do locally in Sublime then just pase the code over and do the necessary fixes there. Once no errors there, I copy back and commit. This is much faster to do than running the Composer archive command (it checks your code and outputs detected errors in terminal) 
   1. `npm install -g composer-playground@next`
6. Fabric-tools install:
   1. `mkdir ~/fabric-tools && cd ~/fabric-tools`
   2. `curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip`
   3. `unzip fabric-dev-servers.zip`
7. Fabric dev environment initial setup:
   1. `export FABRIC_VERSION=hlfv11`
   2. `cd ~/fabric-tools`
	 3. `./downloadFabric.sh`
	 4. `./startFabric.sh`
	 5. `./createPeerAdminCard.sh`

Now you have a dev environment for the two test networks, Rotterdam Logistics manual will follow. runYou can either run the following commands, or run the script named `start_network.sh`
1. Install the composer runtime for our rotterdam_logistics_blocklab business network

`composer runtime install --card PeerAdmin@hlfv1 --businessNetworkName rotterdam_logistics_blocklab`

2. Deploy the network from the business network archive
	
`composer network start --card PeerAdmin@hlfv1 --networkAdmin admin --networkAdminEnrollSecret adminpw --archiveFile rotterdam_logistics_blocklab@0.0.1.bna --file networkadmin.card`
	
This will also create a networkadmin.card file in your current directory. Please do not commit this file.

3. Import the newly created Network Administrator card	

`composer card import --file networkadmin.card`

4. Check if network is running	

`composer network ping --card admin@rotterdam_logistics_blocklab`

## Upgrading Hyperledger Fabric to 1.1
Your first installation should already have the latest version. However if there is a new one released in the future, you can use these steps to update:

1. Remove composer cards/connection profiles
	 1. `composer card list`
	 1. `composer card delete --name admin@rotterdam_logistics_blocklab`
	 1. `composer card delete --name PeerAdmin@hlfv1`
2. Delete the cards in /tmp/ (typed this from memory, name and/or extension might differ!)
	 1. `rm /tmp/PeerAdmin@hlfv1.card`
	 1. `rm /tmp/admin@rotterdam_logistics_blocklab.card`
3. Flush cards from local store (the composer commands didn't remove anything for me initially)
   1. `rm ~/.composer/cards -rf`
4. Remove previous composer versions
	 1. `npm uninstall -g composer-cli`
	 1. `npm uninstall -g composer-rest-server`
	 1. `npm uninstall -g generator-hyperledger-composer`
	 1. `npm uninstall -g composer-playground`
5. Remove Fabric
	 1. `cd ~/fabric-tools` (assuming this is where you initially extracted the fabric-tools archive)
	 1. `./teardownAllDocker.sh` (choose option 2)
6. Remove Tools
	 1. `rm ~/fabric-tools -rf`
7. Perform steps 3 and 5 in the initial setup 
8. Perform step 6 of initial setup
9. run start_test_network.sh
10. enjoy!
