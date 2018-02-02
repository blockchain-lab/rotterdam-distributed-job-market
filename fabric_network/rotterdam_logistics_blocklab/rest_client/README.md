# RESTful api
This folder contains the restuful api in node.js that contains all of the endpoints that are later used by the user interface.

Like with every node.js application `app.js` is the entry point. It uses `routes.js` to point different URLs to different api classes. These can be found in the api folder. There is a different file and class per model.

To start the client, navigate to this folder and run `node app.js`.
This will start the api at `localhost:8081`.

Current list of apis:
- `localhost:8081\trucker\`
- `localhost:8081\containerGuy\`
- `localhost:8081\containerDeliveryJobOffer\`
- `localhost:8081\containerDeliveryJob\`
- `localhost:8081\test\`

### api
Api files only define the endpoints of the application and do not hold any logic.

### service 
Classes located in this folder hold most of the logic for this. They are split by logical models.

### domain
This folder contains a model for every object that is used in the client. Subfolder tx, contains different classes that let us create transactions that we then used on the blockchain.

### connector
This folder is here for connection with the blockchain. Currently the methods we have are generic so we fit everything in `LogisticsNetwork.js` class.

### test
This folder contains classes that are used by test api. Test api is used for initiating hardcoded values that we can use to easily test various api methods without having to manually call them and create every participant/object.

