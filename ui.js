class SliderVar {
    constructor(id) {
        this.id = id;
        this.value = $('#' + id).val();
        var _t = this;

        $('#' + id).on('input', function () {
            $('#' + id + '-value').val($(this).val());
            _t.value = $(this).val();
        });

        $('#' + id + '-value').on('input', function () {
            $('#' + id).val($(this).val());
            _t.value = $(this).val();
        });
    }
}

function detectLongClick(selector) {
    var element = $(selector);
    element.on('mousedown', function(){
        element.data("longClick", setTimeout(function(){
            element.data('dragging', true);
            console.log(element);
        },200));
    });

    $(document).on('mouseup', function() {
        clearTimeout(element.data("longClick"));
        element.data('dragging', false);
    });
}

function allowReorder(container, selector, upCallback, downCallback) {
    $(container).on('mousemove', function(evt) {
        if($(selector).data('dragging')) {
            var r = $(selector);
            evt.preventDefault();
            document.getSelection().removeAllRanges();
            var y = evt.pageY;
            if(!(r.index() == 0)) {
                var prev = r.prev();
                if(y < (prev.position().top + (prev.height() / 2))) {
                    r.insertBefore(prev);
                    upCallback();
                }
            }

            if(!(r.index() == layers.length - 1)) {
                var next = r.next();
                if(y > (next.position().top + (next.height() / 2))) {
                    r.insertAfter(next);
                    downCallback();
                }
            }
        }
    });
}

$(document).on('mousedown', function(e) {
    if(!(e.target.className == "context-item"))
        $('.context-item').remove();
});

//TODO: write contextmenu class or something