const express = require('express');
const app = express();
const hbs = require('hbs');
const session = require('express-session');
const nocache = require('nocache');

const username = "admin";
const password = "admin";

// Middleware setup
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(nocache());

// Session setup
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

// Middleware to prevent caching globally
app.use((req, res, next) => {
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
    });
    next();
});
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Setting view engine
app.set('view engine', 'hbs');

// Middleware for authenticated routes
function authenticate(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        // Check if the password was previously wrong
        if (req.session.passwordwrong) {
            req.session.passwordwrong = false;
            res.render('login', { msg: "Invalid Credentials" });
        } else {
            res.render('login');
        }
    }
});

app.post('/verify', (req, res) => {
    console.log(req.body);

    // Verify username and password
    if (req.body.username === username && req.body.password === password) {
        req.session.user = req.body.username;
        req.session.passwordwrong = false; // Reset error status on success
        res.send(`<script>
            sessionStorage.setItem('user', '${req.body.username}');
            window.location.href = '/home';
        </script>`);
    } else {
        req.session.passwordwrong = true;
        res.redirect('/');
    }
});

app.get('/home', authenticate, (req, res) => {
    res.render('home');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('login', { msg: "Logged out" });
    res.redirect('/');
  
});


// Starting the server
app.listen(3000, () => console.log('Server running on port 3000'));
