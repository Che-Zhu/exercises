var express = require('express');
var cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config()

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(express.json());
app.use(express.urlencoded());

app.post('/api/fileanalyse', upload.single('upfile'), function(req, res) {
  const fileInfo = req.file;
  res.json({
    name: fileInfo.originalname,
    type: fileInfo.mimetype,
    size: fileInfo.size
  })
})



const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
