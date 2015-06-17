var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
methodOverride = require("method-override")
db = require('./models');

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

// Zoo routes

// Root

app.get('/', function(req,res){
	res.redirect('/zoos');
});

// Index
app.get('/zoos', function(req,res){
	db.Zoo.find({}, function(err, zoos){
		res.render("zoos/index", {zoos:zoos});
	});
});

// New
app.get('/zoos/new', function(req, res){
	res.render('zoos/new');
});

// Create
app.post('/zoos', function(req,res){
	db.Zoo.create({name: req.body.name, location: req.body.location}, function(err, zoo){
		if(err){
			console.log(err);
			res.render('zoos/new')
		}
		else {
			console.log(zoo);
			res.redirect('/zoos');
		}
	});
});

// Show

app.get('/zoos/:id', function(req,res){
	db.Zoo.findById(req.params.id, function(err, zoo){
		db.Animal.find(
		{
			_id: {$in: zoo.animals}
		},
		function(err,animals){
			res.render('zoos/show', {zoo:zoo, animals:animals})
		});
	});
});

// Edit

app.get('/zoos/:id/edit', function(req,res){
	db.Zoo.findById(req.params.id, function(err, zoo){
		res.render('zoos/edit', {zoo:zoo});
	});
});

// Update

app.put('/zoos/:id', function(req,res){
	db.Zoo.findByIdAndUpdate(req.params.id, {name: req.body.name, location: req.body.location}, function(err, zoo){
		if(err){
			res.render("zoos/edit")
		} else {
			res.redirect('/zoos')
		}
	})
})

// Destroy

app.delete('zoos/:id', function(req,res){
	db.Zoo.findById(req.params.id, function(err,zoo){
		if(err){
			console.log(err);
			res.render("zoos/show")
		} else {
			zoo.remove();
			res.redirect("/zoos")
		}
	})
})

// Animals routes

// Index
app.get('/zoos/:zoo_id/animals', function(req,res){
	db.Zoo.findById(req.params.zoo_id).populate('animals').exec(function(err,zoo){
		res.render("animals/index", {zoo:zoo});
	});
});

// New
app.get('/zoos/:zoo_id/animals/new', function(req,res){
	db.Zoo.findById(req.params.zoo_id, function(err,zoo){
		res.render('animals/new', {zoo:zoo});
	});
});

// Create
app.post('/zoos/:zoo_id/animals', function(req,res){
	db.Animal.create({name:req.body.name, photo:req.body.photo, species:req.body.species, age:req.body.age}, function (err, animal){
		console.log(animal)
		if(err){
			console.log(err)
			res.render("animals/new");
		} else {
			db.Zoo.findById(req.params.zoo_id,function(err,zoo){
				zoo.animals.push(animal);
				animal.zoo = zoo._id;
				animal.save();
				zoo.save();
				res.redirect("/zoos/"+ req.params.zoo_id+"/animals")
			});
		}
	});
});

// SHOW
app.get('/zoos/:zoo_id/animals/:id', function(req,res){
  db.Animal.findById(req.params.id)
    .populate('zoo')
    .exec(function(err,animal){
      console.log(animal.zoo)
      res.render("animals/show", {animal:animal});
    });
});

// Edit

app.get("/zoos/:zoo_id/animals/:id/edit", function(req,res){
	db.Animal.findById(req.params.id)
	.populate('zoo')
	.exec(function(err,animal){
		res.render("animals/edit", {animal:animal});
	});
});

// Update

app.put('/zoos/:zoo_id/animals/:id', function(req,res){
	db.Animal.findByIdAndUpdate(req.params.id, {name:req.body.name}, function(err,animal){
		if(err){
			res.render("animals/edit");
		} else {
			res.redirect("/animals"+ req.params.zoo_id + "/animals");
		}
	});
});

// Destroy

app.delete('/zoos/:zoo_id/animals/:id', function(req,res){
	db.Animal.findByIdAndRemove(req.params.id, {name:req.body.name}, function (err, animal){
		if(err){
			console.log(err);
			res.render('animals/edit')
		} else {
			res.redirect("/zoos/" + req.params.zoo_id + "/animals");
		}
	})
})

// Catch All

app.get('*', function(req,res){
	res.render('404');
})

// Start Server

app.listen(3000, function(){
	"Server is listening on port 3000"
})