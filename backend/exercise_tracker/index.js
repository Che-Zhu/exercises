const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(process.env["MONGO_URL"]);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const LogSchema = new mongoose.Schema({
  user_id: String,
  description: String,
  duration: Number,
  date: Date
})
const Log = mongoose.model("log", LogSchema);

const UserSchema = new mongoose.Schema({
  username: String,
});
const User = mongoose.model("user", UserSchema);



app.use(express.json());
app.use(express.urlencoded());

app.post('/api/users/', async function(req, res) {
  const userObj = new User({
    username: req.body["username"]
  })

  try {
    const user = await userObj.save();
    res.json({
      username: user["username"],
      _id: user["_id"]
    })
  } catch(err) {
    console.log(err);
  }
})

app.get('/api/users/', async function(req, res) {
  try {
    const users = await User.find({}).exec();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
})

app.post('/api/users/:_id/exercises', async function(req, res) {
  const id = req.params['_id'];
  const {description, duration} = req.body;
  let date = req.body.date;

  try {
    const user = await User.findById(id);

    if (!user) {
      res.send("Could not find user");
    } else {
      date = date? new Date(date) : new Date()
      const logObj = new Log({
        user_id: user['_id'],
        description: description, 
        duration: Number(duration), 
        date: date.toDateString()
      })

      logObj.save();

      res.json({
        username: user.username,
        description: description,
        duration: Number(duration),
        date: date.toDateString(),
        _id: user["_id"]
      })
    }
  } catch (err) {
    console.log(err);
  }
})

app.get('/api/users/:_id/logs', async function(req, res) {
  const id = req.params['_id'];
  const { from, to, limit } = req.query;
  console.log(id, from, to, limit);

  try {
    const user = await User.findById(id);

    let filter = { user_id: user['_id'] };
    let date_filter = {};

    if (from) {
      date_filter["$gte"] = new Date(from);
    }
    if (to) {
      date_filter["$lte"] = new Date(to);
    }

    if (from || to) {
      filter.date = date_filter;
      console.log(date_filter);
    }

    const query = Log.find(filter);

    if (limit) {
      query.limit(limit);
    }
    
    let user_log = await query.exec();

    user_log = user_log.map(item => {
      return ({
        description: item.description,
        duration: Number(item.duration),
        date: item.date.toDateString()
      })
    })
  
    res.json({
      username: user.username,
      _id: id,
      count: user_log.length,
      log: user_log
    });
  } catch(err) {
    console.log(err);
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
