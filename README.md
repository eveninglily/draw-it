# Amidraw

Amidraw is a collaborative drawing platform. It allows room-based, real-time
drawing, with advanced features such as undo/redo, layers, and line smoothing.

## Libraries
### External
- [socket.io](https://github.com/socketio/socket.io)
    - Used for networking/syncing clients
    - MIT License
- [jQuery](https://github.com/jquery/jquery)
    - Used for a lot of UI interactions
    - MIT License

### Internal
(Libraries written during development and spun off)

- [colorwheel.js](https://github.com/McIntireEvan/colorwheel.js)
    - Dynamic HSV Colorwheel
    - MIT License
- [Vial](https://github.com/McIntireEvan/vial)
    - Vue UI components
    - MIT License

## File Overview
- client.js
    - Networking client code
- color.js
    - Interfaces with the colorwheel and other color-related UI actions
- core.js
    - Binds all the canvas events
- io.js
    - Utility functions for file I/O
- keybinds
    - Sets keybinds; loads from localstorage
- layers.js
    - Code for layers, which wrap around OICanvas elements
- revision.js
    - Undo/Redo
- selection.js
    - Unused code for selection and moving areas of the canvas
- tools.js
    - Interfaces with OITools and other items on the toolbar
- ui.js
    - Contains a lot of misc UI code and jQuery events
- server.js
    - The server that syncs clients

## Todo
(This is a non-exhaustive list; it just gives an idea for the next big things)
- [ ] Replace inputs and custom UI stuff with vial
- [ ] Cleanup HTML/CSS
- [ ] Cleanup internal libraries
- [ ] Transition over to a ES6/Webpack structure
- [ ] Better mobile client