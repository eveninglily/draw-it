"use strict";

//TODO: Clean and implement front-end side of this code, document
class Selection {
    constructor(target, lineDash) {
        this.canvas = $('<canvas>').attr('width', target.width)
                            .attr('height', target.height)
                            .css({
                                top: 0,
                                left: 0,
                                width: target.width + 'px',
                                height: target.height+ 'px',
                                position: "absolute",
                                'pointer-events': 'none'
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

        var t = this;

        var selection;
        $(this.target).on('mousedown', function(evt) {
            if(!t.inSelection(evt.offsetX, evt.offsetY)) {
                if(t.selActive == true) {
                    target.getContext('2d')
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
                                top: t.start.y,
                                left: t.start.x,
                                width: t.size.x + 'px',
                                height: t.size.y + 'px',
                                position: "absolute",
                                'pointer-events': 'none'
                            }).appendTo('body');
                    selection.get(0)
                        .getContext('2d')
                            .drawImage(target, t.start.x, t.start.y, t.size.x, t.size.y,
                                        0, 0, t.size.x, t.size.y);
                    ctx.clearRect(t.start.x, t.start.y, t.size.x, t.size.y)
                    t.selActive = true;
                }
            }
            t.mDown = true;
        });

        $(this.target).on('mousemove', function(evt) {
            if(t.active) {

                if(t.inSelection(evt.offsetX, evt.offsetY)) {
                    $('body').addClass('center');
                } else {
                    $('body').removeClass('center');
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
                        top: t.start.y,
                        left: t.start.x
                    });
                }
            }
        });

        $(this.target).on('mouseup', function(evt) {
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
        });

        this.march();
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
