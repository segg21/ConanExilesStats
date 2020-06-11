(function(){
	
	const dgram = require('dgram');
	const Buffer = require('./buffer.js');
	const url = require('url');
	const buffer = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0x54, 0x53, 0x6F, 0x75, 0x72, 0x63, 0x65, 0x20, 0x45, 0x6E, 0x67, 0x69, 0x6E, 0x65, 0x20, 0x51, 0x75, 0x65, 0x72, 0x79, 0x00]);
	const http = require('http');
	
	const IP = '208.115.215.238';
	const PORT = 27015;
	
	http.createServer(function(req, res) {
		res.writeHead(200, {'Content-Type': 'application/json'});
		var args = url.parse(req.url, true).query;
		var socket = dgram.createSocket('udp4');
		var disconnected = false;
		socket.on('close', function(){
			console.log('closed');
			disconnected = true;
		})
		socket.on('connect', function(){
			console.log('connected');
			socket.send(buffer, 0, buffer.length);
			setTimeout(function(){
				if(!disconnected){
					res.writeHead(400);
					res.end();
					return;
				}
			}, 10000);
		})
		socket.on('error', function(){
			res.writeHead(400);
			res.end();
		})
		socket.on('listening', function(){})
		socket.on('message', function(e){
			var b = new Buffer.Reader(e);
			b.readUInt8();
			b.readUInt8();
			b.readUInt8();
			b.readUInt8();
			b.readUInt8();
			var data = {
				Protocol: b.readUInt8(),
				Name: b.readString8(),
				Map: b.readString8(),
				Folder: b.readString8(),
				Game: b.readString8(),
				ID: b.readUInt16(),
				Players: b.readUInt8(),
				MaxPlayers: b.readUInt8(),
				Bots: b.readUInt8(),
				ServerType: String.fromCharCode(b.readUInt8()),
				Environment: String.fromCharCode(b.readUInt8()),
				Visibility: b.readUInt8(),
				Vac: b.readUInt8()
			};
			res.end(JSON.stringify(data));
			socket.disconnect();
			socket = null;
		})
		socket.connect(args.port || 27015, args.ip);
	}).listen(process.env.PORT || 80);
	
})();
