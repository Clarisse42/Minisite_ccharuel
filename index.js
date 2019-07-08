let express = require('express');
let app = express();
let ejs = require('ejs');
let session = require('express-session');
let bodyParser = require('body-parser');
let empty = require('is-empty');
let regexp = require('node-regexp');
let fs = require('fs');




//Moteur de templates
app.set('view engine', 'ejs');



//Midelwares
app.use(express.static('./public/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
	secret: 'keyboard cat',
  	resave: false,
  	saveUninitialized: true,
  	cookie: { secure: false, maxAge: 3000000000000000000 }
}));


	// Routes

//Registration

app.get('/', (req, res) => {

	if (!req.session.username)
	{
		let session = req.session.username;
		res.render('page/registration', {name: 0, fname: 0, mail: 0, age: 0, mailExist: 0, notFilled: 0, session: session, login: 0, regi: 1});
	}
	else
		res.redirect('/home');
});

app.post('/', (req, res) => {

	if (req.body.send == "OK")
	{
		let session = req.session.username;
		if (!empty(req.body.name) && !empty(req.body.fname) && !empty(req.body.mail) && !empty(req.body.age))
		{
			let regname = regexp();
			let regmail = regexp();
			regname = new RegExp(/[a-z]+/);
			regmail = new RegExp(/^[a-z0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$/);
			if (!req.body.name.match(regname) || req.body.name.length < 3)
			{
				res.render('page/registration', {name: 1, fname: 0, mail: 0, age: 0, mailExist: 0, notFilled: 0, session: session, login: 0, regi: 1});
			}
			else if (!req.body.fname.match(regname) || req.body.fname.length < 3)
			{
				res.render('page/registration', {name: 0, fname: 1, mail: 0, age: 0, mailExist: 0, notFilled: 0, session: session, login: 0, regi: 1});
			}
			else if (!req.body.mail.match(regmail))	
			{
				res.render('page/registration', {name: 0, fname: 0, mail: 1, age: 0, mailExist: 0, notFilled: 0, session: session, login: 0, regi: 1});
			}	
			else if (req.body.age < 1 || req.body.age > 77)
			{
				res.render('page/registration', {name: 0, fname: 0, mail: 0, age: 1, mailExist: 0, notFilled: 0, session: session, login: 0, regi: 1});
			}
			else
			{
			 	fs.readFile("DataBase.txt", "UTF-8", function(err, content){
			 		if(err) throw err;
			 		
			 		let oldContent = JSON.parse(content);
			 		if (oldContent[req.body.mail])
			 		{
			 			res.render('page/registration', {name: 0, fname: 0, mail: 0, age: 0, mailExist: 1, notFilled: 0, session: session, login: 0, regi: 1})
			 		}
			 		else
			 		{
			 			let newContent;
			 			oldContent[req.body.mail] = {};
			 			oldContent[req.body.mail].name = req.body.name;
			 			oldContent[req.body.mail].fname = req.body.fname;
			 			oldContent[req.body.mail].age = req.body.age;
			 			newContent = JSON.stringify(oldContent)
			 			fs.writeFile("DataBase.txt", newContent, "UTF-8", function(err){
							if (err) throw err;
							console.log('It\'s saved!');
							res.redirect('/login');
						});
			 		}

			 	});
			}
		}
		else
		{
			res.render('page/registration', {name: 0, fname: 0, mail: 0, age: 0, mailExist: 0, notFilled: 1, session: session, login: 0, regi: 1});
		}
	}
});

//Login

app.get('/login', (req, res) => {

	if (!req.session.username)
	{
		let session = req.session.username;
		res.render('page/login', {notFilled: 0, badId: 0, session: session, login: 1, regi: 0});
	}
	else
		res.redirect('/home');
});

app.post('/login', (req, res) =>{

	if (req.body.send == "OK")
	{
		let session = req.session.username;
		if (!empty(req.body.fname) && !empty(req.body.mail))
		{
			fs.readFile("DataBase.txt", "UTF-8", function(err, content){
				if (err) throw err;

				content = JSON.parse(content);

				 if (content[req.body.mail] && content[req.body.mail].fname == req.body.fname)
				 {
				 	req.session.username = req.body.fname;
				 	req.session.mail = req.body.mail;
				 	res.redirect('/home');
				 }
				 else
				 {
				 	res.render('page/login', {notFilled: 0, badId: 1, session: session, login: 1, regi: 0});
				 }
				
			});
		}
		else
		{
			res.render('page/login', {notFilled: 1, badId: 0, session: session, login: 1, regi: 0});
		}
	}

});

//Home

app.get('/home', (req, res) =>{

	if (req.session.username)
	{
		let session = req.session.username;
		fs.readFile("DataBase.txt", "UTF-8", function(err, content){
			if (err) throw err;

			content = JSON.parse(content);
			let mail = req.session.mail;
			let age = content[req.session.mail].age;
			let fname = content[req.session.mail].fname;
			let name = content[req.session.mail].name;
			res.render('page/home', {mail: mail, age: age, name: name, fname: fname, session: session, login: 1, regi: 1});
		});
		
	}
	else
		res.redirect('/');
});	

app.post('/home', (req, res) => {

	if (req.body.sendFname == "OK")
	{
		let session = req.session.username;
		if (!empty(req.body.fname))
		{
			let regFname = regexp();
			regFname = new RegExp(/[a-z]+/);
			if (!req.body.fname.match(regFname) || req.body.fname.length < 3)
			{
				
			}
			else
			{	
				fs.readFile("DataBase.txt", "UTF-8", function(err, content){
					if (err) throw err;

					content = JSON.parse(content);
					content[req.session.mail].fname = req.body.fname;
					req.session.username = req.body.fname;
					content = JSON.stringify(content);
					fs.writeFile("DataBase.txt", content, "UTF-8", function(err){
						if (err) throw err;

						res.redirect('/home');
					});
				});
			}

		}
		else
		{
			res.redirect('/home');
		}
	}
	if (req.body.sendAge == "OK")
	{
		if (!empty(req.body.age))
		{
			if (req.body.age < 1 || req.body.age > 77)
			{
				
			}
			else
			{	
				fs.readFile("DataBase.txt", "UTF-8", function(err, content) {
					if (err) throw err;

					content = JSON.parse(content);
					console.log(content[req.session.mail].age);
					content[req.session.mail].age = req.body.age;
					content = JSON.stringify(content);
					fs.writeFile("DataBase.txt", content, "UTF-8", function(err){
						if (err) throw err;

						res.redirect('/home');
					});
				});	
			} 
		}
		else
		{
			res.redirect('/home');
		}
	}
});

//Logout

app.get('/logout', (req, res) => {

	req.session.destroy();
    res.redirect('/login');
});

app.listen(process.env.PORT || 5000, function() {
	console.log("listenning on port 4242");
});
