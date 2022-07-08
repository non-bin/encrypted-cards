function main(args) {
	console.log(args)
	return {"body": '<pre>' + JSON.stringify(args, null, 2) + '</pre>'}
}

exports.main = main
