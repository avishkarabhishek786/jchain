var Blockchain =  require("./blockchain")

var blockchain1 = new Blockchain();


let previousBlockHash = "HJGHGKHJHGGFGHGJJKLKLK";
let currentBlockData = [
	{
		sender: 'HGHJKLKLJKHGHJK',
		recipient: 'HFGUIUYTYUIKMNB',
		amount: 876
	},
	{
		sender: 'HGHJKLKLJKHGHJK',
		recipient: 'HFGUIUYTYUIKMNB',
		amount: 876
	},
	{
		sender: 'HGHJKLKLJKHGHJK',
		recipient: 'HFGUIUYTYUIKMNB',
		amount: 876
	},
	{
		sender: 'HGHJKLKLJKHGHJK',
		recipient: 'HFGUIUYTYUIKMNB',
		amount: 876
	}
];

console.log(blockchain1)
//console.log(blockchain1.proofOfWork(previousBlockHash, currentBlockData));
//console.log(blockchain1.hashBlock(previousBlockHash, currentBlockData, 74405));