const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const ejs = require('ejs');
const path = require('path');
const adminRoutes = require('./AdminRoutes');
const db = require('./db'); // Import the db.js module
const { user } = require('pg/lib/defaults');

const app = express();
app.use(adminRoutes);
app.use('/admin', adminRoutes);

app.use(express.urlencoded({ extended: true }));
app.use(express.static('frontend'));
app.use('/', adminRoutes);
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        secure: false
    }
}));

app.set('views', path.join(__dirname, '..', 'frontend'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => {
    res.render('Home', { loggedIn: false });
});



app.get('/registerPage', (req, res) => {
    res.render('register'); //register.ejs
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Check if the email is already registered
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error checking email:', err);
            res.status(500).send('Error checking email');
            return;
        }

        if (results.length > 0) {
            // User with the provided email already exists
            res.status(400).send('User with this email already exists');
            return;
        }

        // Insert the new user into the database
        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [username, email, password], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                res.status(500).send('Error registering user');
                return;
            }
            // User successfully registered
            console.log('User registered successfully');
            // Redirect the user to the Login page
            res.render('login', {errorMessage : 'Register Successful' });
        });
    });
});

//get login page
app.get('/loginPage', (req, res) => {
    res.render('login', {errorMessage: ''});
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if email exists in database
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        console.log(email);
        if (err) {
            console.error('Error retrieving user:', err);
            res.status(500).send('Error retrieving user');
            return;
        }

        if (results.length === 0) {
            // User with provided email not found
            res.render('login', { errorMessage: 'Invalid email or password. Please try again.' });
            return;
        }

        // User found, compare passwords
        const user = results[0];
        console.log(results);

        if(password === user.password){
            // Passwords match, set session and send response
            req.session.user = { userId: user.user_id, id: '123', username: user.name };
            console.log(req.session.user);

            //set cookie
            res.cookie('user', JSON.stringify(req.session.user), { path: '/'});
            const loggedIn = true;
            // res.status(200).send('Logged in successfully');
            res.render('Home', {loggedIn});

        } else {
            // Passwords don't match
            res.render('login', { errorMessage: 'Invalid email or password. Please try again.' });

        }
    });
});

//logout
app.get('/logout', (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error destroying session');
            return;
        }

        // Set loggedIn variable to false
        const loggedIn = false;

        // Redirect user to home page with loggedIn variable set to false
        res.render('Home', { loggedIn });
    });
});

// Handle complaint submission
app.post('/submit-complaint', (req, res) => {
    // Extract data from the request body
    const { category, content } = req.body;
    category_id = Number(category);
    
    if (!req.session.user) {
        return res.render('login', { errorMessage: 'Please log in first to view complaints' });
    }
    // console.log("Session: ",req.session.userId);
    const user_id = req.session.user.userId;

    /*console.log('Received complaint submission:');
    console.log('userId: ',user_id);
    console.log('Category:', typeof category_id);
    console.log('Content:', content);*/

    // Insert the data into the complaints table
    const query = 'INSERT INTO complaints (user_id, category_id, content) VALUES (?, ?, ?)';
    db.query(query, [user_id, category_id, content], (err, result) => {
    if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error submitting complaint');
        return;
    }
    console.log('Complaint inserted successfully.');

    // Respond to the client with a success message
    res.status(200).send('Complaint submitted successfully');
    });

});

//Complaint page
app.get('/Complaint', (req, res) => {
    res.render('Complaint');
});
app.get('/Home', (req, res) => {
    if (!req.session.user) {
        // If user session doesn't exist, render a message to prompt login
        return res.render('Home', {loggedIn : false});
    }
    res.render('Home', {loggedIn : true});
});

//Access complaints
app.get('/complaints', (req, res) => {
    if (!req.session.user) {
        return res.render('login', { errorMessage: 'Please log in first to view complaints' });
    }
    // Retrieve user ID from session or request parameters
    const userId = req.session.user.userId;

    // Database Query to fetch complaints for the user with category names
    const query = `
    SELECT complaints.complaint_id, complaints.user_id, complaints.content, complaints.complaint_status, categories.category_name
    FROM complaints
    INNER JOIN categories ON complaints.category_id = categories.category_id
    WHERE complaints.user_id = ?
    ORDER BY complaints.complaint_id DESC;
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching complaints:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Render the EJS template and pass the complaints data as a variable
        res.render('Complaints', { complaints: results });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
