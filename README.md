Night and Day
=============
Visualisation of the night and day cycle using photos from Flickr.

Installation
------------
This project uses the Flickr API. A key is required. [Request one here](https://secure.flickr.com/services/api/keys/apply/).

This project uses node.js. To setup on Mac using Homebrew:

    brew install node

Then, clone and install the dependencies:

    git clone https://github.com/fdb/night-and-day.git
    cd night-and-day
    npm install

Running:

    export FLICKR_API_KEY="YOUR_API_KEY_HERE"
    node app.js
