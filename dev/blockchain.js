const shajs = require('sha.js')
const currentNodeUrl = process.argv[3]

function Blockchain() {
	this.chain = [];
	this.pendingTransactions = [];
	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];

	// create Genesis block
    this.createNewBlock(100, "NOPREVBLOCKHASHXXXXXXXXX", "CURRENTBLOCKHASHXXXXXXXX")
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	//create new block
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	}

	//push new block into the chain
	this.chain.push(newBlock);

	//empty the new Transactions array
	this.pendingTransactions = [];

	//return the new block
	return newBlock;
}

Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length-1];
}

Blockchain.prototype.createNewTransaction = function(amount, sender, recipient) {
	//create new transaction
	const newTransaction = {
		amount: amount,
		sender: sender,
		recipient: recipient
	}

	//push this transaction into the 'next' block
    this.pendingTransactions.push(newTransaction);

    // return index number of next block
	return this.getLastBlock().index+1;

}

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)
	return shajs('sha256').update(dataString).digest('hex');
}

Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while(hash.substr(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
		//console.log(hash);
	}
	return nonce;
}

module.exports = Blockchain;