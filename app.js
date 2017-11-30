const express       = require('express');
const exphbs        = require('express-handlebars');
const bodyParser    = require('body-parser');
const mongoose      = require('mongoose');
const app           = express();

// Map gloabal promise - get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
    useMongoClient: true
})
    .then(() => console.log('mongoDB is connected:'))
    .catch(err => console.log(err));

// Load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');


// Handle Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


// Index Route
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
        title: title,
    });
});


// About Route
app.get('/about', (req, res) => {
    res.render('about');
});

// Idea Index Page
app.get('/ideas', (req, res) => {
   Idea.find({})
    .sort({date: 'desc'})
    .then( ideas => {
        res.render('ideas/index', {
            ideas: ideas,
        });
    });
});


// Add Idea Form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');

});

// Edit Idea Form
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        res.render('ideas/edit', {
            idea: idea
        })
    })
    res.render('ideas/edit');

});

// Process Form
app.post('/ideas', (req, res) => {
    // res.send('ok');
    // console.log(req.body.title);
    
    let errors = [];
    
    if(!req.body.title){
        errors.push({text: "Please add a title"});
    }
    if(!req.body.details){
        errors.push({text: "Please add a Details"});
    }
    if(errors.length > 0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }else{
       const newUser = {
        title: req.body.title,
        details: req.body.details,
       }
       new Idea(newUser)
            .save()
            .then(idea => {
                res.redirect('/ideas');
            })
   }
});


const port = 5000;
app.listen(port, () =>{
    console.log(`Server start at port ${port}`);
});

