const express = require('express');
const bodyParser = require('body-parser');
const translate = require('@vitalets/google-translate-api');
const app = express();

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/', (req, res) => {
	const {text} = req.body;
	translate(text, {from: 'ja', to: 'en'})
	.then(translated => {
    return translated.text;
	})
	.then(text => {
		res.json(text);
	})
	.catch(err => {
	  res.status(400).json("error translating");
	});
}) 


app.listen(3000, () => {
	console.log('app is running on port 3000');
})