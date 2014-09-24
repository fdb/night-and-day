function convertRange(v, inMin, inMax, outMin, outMax) {
    var inDelta;
    inDelta = inMax - inMin;
    if (inDelta !== 0) {
        v = (v - inMin) / inDelta;
    } else {
        v = 0.5;
    }
    return outMin + v * (outMax - outMin);

}


function addPhoto(photo) {
    var photoSize = 25;
    var top = convertRange(photo.latitude, 90, -90, 0, 600) - photoSize / 2;
    var left = convertRange(photo.longitude, -180, 180, 0, 1000) - photoSize / 2;
    var imgEl = document.createElement('img');
    console.log(top, left);
    imgEl.src = photo.url;
    imgEl.style.position = 'absolute';
    imgEl.style.left = left + 'px';
    imgEl.style.top = top + 'px';
    imgEl.style.width = photoSize + 'px';
    var container = document.querySelector('.photos');
    container.appendChild(imgEl);
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('load');
    var socket = io();
    socket.on('photo', function (photo) {
        console.log(photo);
        addPhoto(photo);
    });
});
