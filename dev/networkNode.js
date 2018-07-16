const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid/v1')
const port = process.argv[2]
const rp = require('request-promise')

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


// Register a node and broadcast it to the network
app.post('/register-and-broadcast-node', (req, res)=>{
	// data to be sent to all nodes
	const newNodeUrl = req.body.newNodeUrl 
	// check if data already exists in networkNodes array
	if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1) {
		bitcoin.networkNodes.push(newNodeUrl)
	}
	// create an array for option promises
	const regNodesPromises = []
	// create options for promises and push into the array
	bitcoin.networkNodes.forEach((networkNodeUrl)=>{
		let networkOptions = {
			method: 'post',
			uri: networkNodeUrl + '/register-node',
			body: {newNodeUrl:newNodeUrl},
			json: true
		}
		regNodesPromises.push(rp(networkOptions))
	})
	// Fire the promises and handle the response
	Promise.all(regNodesPromises)
		// Now that we have informed all other nodes of the new node its time
		// to inform the new node about all the other nodes using register-nodes-bulk api
		.then((data)=>{
			let bulkRegOptions = {
				method: 'post',
				uri: newNodeUrl + '/register-nodes-bulk',
				body: {allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
				json: true
			}
			return rp(bulkRegOptions)
		})
		.then((data)=>{
			res.json({note: 'New node registered with network succesfully.'})
		})

})


// register a node with the network
app.post('/register-node', (req, res)=>{
	const newNodeUrl = req.body.newNodeUrl;
	let NodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	let notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

	if (NodeNotAlreadyPresent && notCurrentNode) {
		bitcoin.networkNodes.push(newNodeUrl);
		res.json({note: 'New node registered succesfully.'})
	} else {
		res.json({error: 'register-node process failed.'})		
	}
})

//bulk node register
app.post('/register-nodes-bulk', (req, res)=>{
	const allNetworkNodes = req.body.allNetworkNodes
	allNetworkNodes.forEach((networkNodeUrl)=>{
		let NodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1
		let notCurrentNode = networkNodeUrl !== bitcoin.currentNodeUrl
		if (NodeNotAlreadyPresent && notCurrentNode) {
			bitcoin.networkNodes.push(networkNodeUrl)
		}		
	})
	res.json({note: 'All nodes registered in your network.'})
})

app.listen(port, function() {
	console.log(`Application running on port ${port}`);
})