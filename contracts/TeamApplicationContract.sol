pragma solidity ^0.4.4;

contract TeamApplicationContract {
	bool accepted;
	address owner;

	event TeamApplicationAccepted(address accepter);
	
	function TeamApplicationContract() public {
		// constructor
		owner = msg.sender;
		accepted = false;
	}

	function accept() public {
		if (!accepted) {
			accepted = true;
			TeamApplicationAccepted(msg.sender);
		}
	}

	function isAccepted() public constant returns (bool) {
		return accepted;
	}

	function kill() public {
		if (msg.sender == owner) {
			selfdestruct(owner);
		}
	}
}
