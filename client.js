var socket;

function connect(server, id) {
	socket = io(server);

	socket.emit('join', {
		'id': id
	});

	socket.on('handshake', function(data) {
		//Recieved a response from the server, everything is good to go
		console.log('Connected to server! Room ID: ' + data.id);
		window.location.href = "#" + data.id
	});

    socket.on('start', function(data) {
        console.log(data);
        layers[data.layer].beginStroke(data.tool, data.x, data.y, data.cId);
		layers[data.layer].doStrokes(data.cId);
    }).on('update', function(data){
        console.log(data);
        layers[data.layer].strokes[data.cId].addPoint(data.x, data.y);
        layers[data.layer].doStrokes(data.cId);
    }).on('end', function(data) {
        layers[data.layer].completeStroke(layers[data.layer].strokes[data.cId]);
        addChange(layers[data.layer].strokes[data.cId]);
        $('.selected').children(':nth-child(1)').html(layers[data.layer].toImage());
    });
}

if(window.location.href.split('#').length == 2) {
	connect('https://dev2.nodedraw.com', window.location.href.split('#')[1]);
} else {
	connect('https://dev2.nodedraw.com', null);
}

$('#layers').on('mousedown', function(e) {
	socket.emit('start', {
		x: e.offsetX,
		y: e.offsetY,
        id: window.location.href.split('#')[1],
        layer: currentLayer,
        tool: currTool
	});
}).on('mouseup', function(e) {
	socket.emit('end', {
		x: e.offsetX,
		y: e.offsetY,
        id: window.location.href.split('#')[1],
        layer: currentLayer
	});
}).on('mousemove', function(e) {
	if(down) {
        socket.emit('update', {
		    x: e.offsetX,
		    y: e.offsetY,
            id: window.location.href.split('#')[1],
            layer: currentLayer
	    });
	}
});
