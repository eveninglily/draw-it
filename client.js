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
		}).on('save-s', function(data) {
			console.log("File saved to https://nodedraw.com/amidraw/gallery/" + data.uuid + ".png");
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
		if(down) {
			this.socket.emit('update', {
				x: x,
				y: y,
				id: this.id,
				layer: currentLayer
			});
		}
	}

	sendEnd(x, y) {
		if(down) {
			this.socket.emit('end', {
				x: x,
				y: y,
				id: this.id,
				layer: currentLayer
			});
		}
	}
}
var c;
function connect() {
	
if(window.location.href.split('#').length == 2) {
	c = new Client('https://dev2.nodedraw.com', "testroom");
} else {
	c = new Client('https://dev2.nodedraw.com', "testroom");
}

$('#layers').on('mousedown', function(e) {
	c.sendStart(e.offsetX, e.offsetY);
}).on('mousemove', function(e) {
	if(down) {
	c.sendMove(e.offsetX, e.offsetY);
	}
}).on('touchstart', function (evt) {
	c.sendStart(evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left, evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top);
}).on('touchmove', function (evt) {
		c.sendMove(
			evt.originalEvent.touches[0].pageX - $('#layers').offset().left,
			evt.originalEvent.touches[0].pageY - $('#layers').offset().top
		);
});

$(document).on('mouseup', function(e) {
	c.sendEnd(e.offsetX, e.offsetY);
}).on('touchend touchcancel', function(evt){
	c.sendEnd(
			evt.originalEvent.changedTouches[0].pageX - $('#layers').offset().left,
			evt.originalEvent.changedTouches[0].pageY - $('#layers').offset().top
		);
});
}

function sFile() {
	if(c != null)
		c.socket.emit('save', {'b64': getMergedVisibleCanvas().get(0).toDataURL()});
}