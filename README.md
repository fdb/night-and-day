Night and Day
=============
Visualisation of the night and day cycle using photos from Flickr.

Installation
------------
This project uses the Flickr API. A key is required. [Request one here](https://secure.flickr.com/services/api/keys/apply/).

This project is a client-server application, with the server written in [node.js](http://nodejs.org/). To setup on Mac using Homebrew:

    brew install node

Then, clone and install the dependencies:

    git clone https://github.com/fdb/night-and-day.git
    cd night-and-day
    npm install

Running:

    export FLICKR_API_KEY="YOUR_API_KEY_HERE"
    node app.js
        
Colophon
--------
* [Flickr API](https://secure.flickr.com/services/api/): where the data comes from
* [node.js](http://nodejs.org/): web server and fetch process
* [request](https://github.com/mikeal/request): HTTP client for node.js
* [socket.io](http://socket.io/): real-time server-to-browser communications
* [NeDB](https://github.com/louischatriot/nedb): light-weight embedded database
* [JSHint](http://www.jshint.com/docs/): bringing sanity to JavaScript
* [Underscore](http://underscorejs.org/): essential JavaScript helpers
