var Migrations = artifacts.require("./TeamApplicationContract.sol");

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  	deployer.deploy(Migrations);
};
