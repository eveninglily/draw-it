var socket;

class Client {
	constructor(server, id) {
		this.connected = false;
		this.socket = io(server);
		this.socket.emit('join-room', {
			'id': id
		});

		this.socket.on('handshake', function(data) {
			//Recieved a response from the server, everything is good to go
			console.log('Connected to server! Room ID: ' + data.id);
			window.location.href = "#" + data.id
			this.id = data.id;
		});
		this.id = "testroom";
		this.socket.on('start', function(data) {
			layers[data.layer].canvas.beginStroke(data.tool, data.x, data.y, data.cId);
			activeStrokes.push(data.cId);
			layers[data.layer].canvas.doStrokes(activeStrokes);
		}).on('update', function(data){
			layers[data.layer].canvas.strokes[data.cId].addPoint(data.x, data.y);
			layers[data.layer].canvas.doStrokes(activeStrokes);
		}).on('end', function(data) {
			layers[data.layer].canvas.completeStroke(layers[data.layer].canvas.strokes[data.cId]);
			addChange(layers[data.layer].canvas.strokes[data.cId]);
			for(var i = 0; i < activeStrokes.length; i++) {
				if(activeStrokes[i] == data.cId) {
					activeStrokes.splice(i, 1);
					break;
				}
			}
			layers[data.layer].updatePreview();
		});
	}

	sendStart(x, y) {
		this.socket.emit('start', {
			x: x,
			y: y,
			id: this.id,
			layer: currentLayer,
			tool: currTool
		});
	}

	sendMove(x, y) {
		this.socket.emit('update', {
		    x: x,
		    y: y,
            id: this.id,
            layer: currentLayer
	    });
	}

	sendEnd(x, y) {
		this.socket.emit('end', {
			x: x,
			y: y,
			id: this.id,
			layer: currentLayer
		});
	}
}
function connect() {
	var c;
if(window.location.href.split('#').length == 2) {
	c = new Client('https://dev2.nodedraw.com', "testroom");
} else {
	c = new Client('https://dev2.nodedraw.com', "testroom");
}

$('#layers').on('mousedown', function(e) {
	c.sendStart(e.offsetX, e.offsetY);
}).on('mouseup', function(e) {
	c.sendEnd(e.offsetX, e.offsetY);
}).on('mousemove', function(e) {
	if(down) {
	c.sendMove(e.offsetX, e.offsetY);
	}
});
}