//TODO: consider cleanup?
function setupClipboard() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        $(document).on('dragover dragenter', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }).on('drop', function (evt) {
            var files = evt.originalEvent.dataTransfer.files;
            if (files.length == 0) {
                return;
            }
            if(!files[0].type.match('image.*')) {
                return;
            }
            drawFile(files[0], evt.originalEvent.pageX, evt.originalEvent.pageY)
            evt.preventDefault();
            evt.stopPropagation();
        }).on('paste', function(evt) {
            var data = evt.originalEvent.clipboardData;
            if(data) {
                var items = data.items;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf("image") !== -1) {
                        var blob = items[i].getAsFile();
                        drawFile(blob, 0, 0); //TODO: Change vals
                        return;
                    }
                }
                var files = data.files;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].type.indexOf("image") !== -1) {
                        drawFile(files[i], 0, 0); //TODO: Change vals
                        return;
                    }
                }
            }
        });
    } else {
        console.log('Error attaching drop and paste events');
    }
}

//TODO: Change when transform tools are written
function drawFile(file, x, y) {
	layers[currentLayer].drawBlob(file, x, y);
}