// This should generally go in ExContent

/**
     * Loads a canvas from localstorage
     * @param {String} name - Name of the canvas
     *
    public static loadFromLocalStorage(name) {
        /* Attempt to get the canvas from localstorage *
        if (localStorage.getItem('canvas-' + name)) {
            /* Load the B64 image from localstorage *
            const img = new Image;
            img.src = localStorage.getItem('canvas');

            /* Draw our image onto a canvas *
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            /* Create a new OICanvas with the loaded image *
            return new OICanvas(canvas, name);
        }
        return null;
    }

    /**
     * Saves canvas to disk
     *
    public saveToDisk() {
        const data = this.toImage().src.replace('image/png','image/octet-stream');
        window.location.href = data;
    }

    /**
     * Saves canvas to localStorage
     *
    public saveToLocalstorage() {
        localStorage.setItem('canvas-' + this.name, this.canvas.toDataURL());
    }

    /**
     * Returns an image element containing the canvas contents
     *
    public toImage() {
        const image = new Image();
        image.src = this.canvas.toDataURL();
        return image;
    }

    /**
     * Loads a DataURL into the canvas at 0,0
     * @param {string} data - The DataUrl
     *
    public loadDataURL(data) {
        const image = new Image();
        image.onload = (() => {
            this.ctx.drawImage(image, 0, 0);
            this.bCtx.drawImage(image, 0, 0);
        });
        image.src = data;
    }

    /**
     * Draws a blob onto the canvas
     * @param {object} blob - The blob to draw
     * @param {number} x - X coordinate to draw at
     * @parm {number} y - Y coordinate to draw at
     *
    public drawBlob(blob, x, y) {
        const reader = new FileReader();
        reader.onload = (() => {
            const img = new Image();
            img.src = reader.result;
            img.onload = (() => {
                this.ctx.drawImage(img, x, y);
                this.bCtx.drawImage(img, x, y);
            });
        });
        reader.readAsDataURL(blob);
    }



    */