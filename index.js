const express = require('express');             // Import expressjs
const mongoose = require('mongoose');           // Import mongoose

const port = process.env.PORT || 3000;
const app = express();                       // Create expressjs object

// Connect MongoDb
// mongoose.connect('mongodb://localhost:27017/BlogDb');    // Local
mongoose.connect('mongodb://BlogUser:bloguser123@cluster0-shard-00-00.mourb.mongodb.net:27017,cluster0-shard-00-01.mourb.mongodb.net:27017,cluster0-shard-00-02.mourb.mongodb.net:27017/BlogDb?ssl=true&replicaSet=atlas-jdfk2u-shard-0&authSource=admin&retryWrites=true&w=majority');
// Check connection is established
const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDb connected');
});

// middleware
app.use(express.json())
const userRoute = require('./routes/user');
app.use('/user', userRoute);

app.route('/').get((req, res) => res.json('Hello World!'));
app.listen(port, () => console.log(`Your server is running on port ${port}`));