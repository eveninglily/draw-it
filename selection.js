"use strict";

//TODO: Clean, document
//CURRENTLY UNUSED AND A WIP
class Selection {
    constructor(target, lineDash) {
        this.canvas = $('<canvas>').attr('width', target.width)
                            .attr('height', target.height)
                            .css({
                                top: $('#layers').position().top,
                                left: $('#layers').position().left,
                                width: target.width + 'px',
                                height: target.height+ 'px',
                                position: "absolute",
                                'pointer-events': 'none',
                                'z-index': '10000'
                            }).appendTo('body').get(0);
        this.canvas.getContext('2d').strokeStyle = "black";
        this.target = target;

        this.lineDash = lineDash;
        this.mDown = false;
        this.active = false;
        var selActive = false;
        this.offset = 0;

        this.start = { x: 0, y: 0 };
        this.size = { x: 0, y: 0 };
        this.diff = { x: 0, y: 0 };

        var selection;
        $(this.target).on('mousedown', {t:this},this.mouseDown);
        $(this.target).on('mousemove', {t:this},this.mouseMove);
        $(this.target).on('mouseup', {t:this},this.mouseUp);

        this.march();
    }

    mouseDown(evt) {
        var t = evt.data.t;
            if(!t.inSelection(evt.offsetX, evt.offsetY)) {
                if(t.selActive == true) {
                    t.target.getContext('2d')
                                    .drawImage(selection.get(0), 0, 0, t.size.x, t.size.y,
                                                t.start.x, t.start.y, t.size.x, t.size.y);
                    selection.remove();
                    t.selActive = false;
                }
                t.size = { x: 0, y: 0 };
                t.start.x = evt.offsetX;
                t.start.y = evt.offsetY;
                t.active = false;
            } else {
                t.diff.x = evt.offsetX - t.start.x;
                t.diff.y = evt.offsetY - t.start.y;
                if(!t.selActive) {
                    selection =
                        $("<canvas>")
                            .attr('width', t.size.x)
                            .attr('height', t.size.y)
                            .css({
                                top: $('#layers').position().top + t.start.y,
                                left: $('#layers').position().left + t.start.x,
                                width: t.size.x + 'px',
                                height: t.size.y + 'px',
                                position: "absolute",
                                'pointer-events': 'none'
                            }).appendTo('body');
                    selection.get(0)
                        .getContext('2d')
                            .drawImage(t.target, t.start.x, t.start.y, t.size.x, t.size.y,
                                        0, 0, t.size.x, t.size.y);
                    t.target.getContext('2d').clearRect(t.start.x, t.start.y, t.size.x, t.size.y)
                    t.selActive = true;
                }
            }
            t.mDown = true;
    }

    mouseUp(evt) {
        var t = evt.data.t;
        if(t.mDown) {
            if(!t.active) {
                t.size.x = evt.offsetX - t.start.x;
                t.size.y = evt.offsetY - t.start.y;
                if(t.size.x < 0) {
                    t.start.x += t.size.x;
                    t.size.x *= -1;
                }
                if(t.size.y < 0) {
                    t.start.y += t.size.y;
                    t.size.y *= -1;
                }
                t.active = true;
            }
            t.mDown = false;
        }
    }

    mouseMove(evt) {
        var t = evt.data.t;
        if(t.active) {
            if(t.inSelection(evt.offsetX, evt.offsetY)) {
                $('.layer').addClass('move');
            } else {
                $('.layer').removeClass('move');
            }
        }

        if(t.mDown) {
            if(!t.active) {
                t.size.x = evt.offsetX - t.start.x;
                t.size.y = evt.offsetY - t.start.y;
                t.drawSelection();
            } else {
                t.start.x = evt.offsetX - t.diff.x;
                t.start.y = evt.offsetY - t.diff.y;
                selection.css({
                    top: $('#layers').position().top + t.start.y,
                    left: $('#layers').position().left + t.start.x
                });
            }
        }
    }

    detach() {
        $(this.target).off('mousedown', this.mouseDown);
        $(this.target).off('mousemove', this.mouseMove);
        $(this.target).off('mouseup', this.mouseUp);
    }

    drawSelection() {
        this.canvas.getContext('2d').clearRect(0,0,this.canvas.width, this.canvas.height);
        this.canvas.getContext('2d').setLineDash(this.lineDash);
        this.canvas.getContext('2d').lineDashOffset = this.offset;

        this.canvas.getContext('2d').strokeRect(this.start.x, this.start.y, this.size.x, this.size.y);
    }

    march() {
        this.offset--;
        this.drawSelection();
        setTimeout(this.march.bind(this), 25);
    }

    inSelection(x, y) {
        return ((x >= this.start.x) && (x <= (this.start.x + this.size.x) ) && (y >= this.start.y) && (y <= (this.start.y + this.size.y)));
    }
}