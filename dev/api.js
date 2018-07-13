const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v1')

const nodeAddress = uuid().split('-').join('')

let app = express()

const Blockchain = require('./blockchain')
let bitcoin = new Blockchain()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))


app.get('/blockchain', (req, res)=> {
	res.send(bitcoin)
})

app.post('/transaction', (req, res)=>{
	let blockIndex = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient)
	res.send(`Your transaction should go in block ${blockIndex}.`)
})

app.get('/mine', (req, res)=>{
	let lastBlock = bitcoin.getLastBlock()
	let previousBlockHash = lastBlock.hash
	let currentBlock = {
		pendingTransactions: bitcoin.pendingTransactions,
		index: lastBlock.index
	}
	let nonce = bitcoin.proofOfWork(previousBlockHash, currentBlock)
	let hash = bitcoin.hashBlock(previousBlockHash, currentBlock, nonce)

	// Reward block
	bitcoin.createNewTransaction(12.5, "x00", nodeAddress)

	let newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, hash)

	res.json({
		note: "New block mined successfully.",
		block: newBlock
	})

})

app.listen(3000, function() {
	console.log('Application running on port 3000');
})