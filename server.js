const https = require('https');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();
const app = express();
const port = 4000;
// Connect to the database
app.use(cors({origin: true}));
app.use(express.json());
mongoose
  .connect(process.env.DB, {useNewUrlParser: true})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err));

const groupRouter = require('./routes/groups');
app.use('/groups', groupRouter);


  app.listen(port, function () {
    console.log('Server is running on Port: ' + port);
  });
/*
mongoose
  .connect(process.env.DB, {useNewUrlParser: true})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.log(err));
// Since mongoose's Promise is deprecated, we override it with Node's Promise
mongoose.Promise = global.Promise;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});
app.use(bodyParser.json());
app.use('/api', routes);
app.use((err, req, res, next) => {
  console.log(err);
  next();
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

*/
const {createServer} = require('http');
const {Server} = require('socket.io');
// socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});
io.on('connection', socket => {
  console.log('Num Of Users online ' + io.engine.clientsCount);
  console.log(socket.id);
});

httpServer.listen(3000);
