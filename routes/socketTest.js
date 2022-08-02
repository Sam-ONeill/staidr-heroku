const router = require('express').Router();
const {io} = require('socket.io-client');
let el;
const socket = io('https://staidr-heroku.herokuapp.com');

router.get('/', async (req, res) => {
    socket.on('time', function(timeString) {
        el = document.getElementById('server-time')
        el.innerHTML = 'Server time: ' + timeString;
    });
});

module.exports = router;



