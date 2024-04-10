const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db');
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

router.post('/adminLogin', (req, res) => {
    console.log(req.body);
    const { work_id, email, password } = req.body;

    db.query('SELECT * FROM admin WHERE work_id = ? AND email = ? AND password = ?', [work_id, email, password], (err, results) => {
        if (err) {
            console.error('Error checking admin credentials:', err);
            res.status(500).send('Error checking admin credentials');
            return;
        }

        if (results.length > 0) {
            req.session.admin = results[0]; //session created
            const adminName = req.session.admin.name;
            // const adminWorkId = req.session.work_id;
            // Query the complaints table for complaints with category_id matching work_id
            db.query('SELECT * FROM complaints WHERE category_id = ? AND complaint_status = ?', [req.session.admin.work_id, 'working'], (err, complaintResults) => {
                if (err) {
                    console.error('Error fetching complaints:', err);
                    res.status(500).send('Error fetching complaints');
                    return;
                }

                console.log(complaintResults);
                // Render the HomeAdmin page with adminName and complaints data
                res.render('HomeAdmin', { adminName, complaints: complaintResults });
            });
        } else {
            res.render('login', { errorMessage: 'Invalid admin credentials. Please try again.' });
        }
    });
});

router.get('/HomeAdmin', (req, res) => {
    const workId = req.session.admin.work_id;

    // Database Query to fetch complaints with category_id matching work_id
    const query = `
        SELECT complaint_id, user_id, content, complaint_status
        FROM complaints
        WHERE category_id = ?
    `;
    db.query(query, [workId], (err, results) => {
        if (err) {
            console.error('Error fetching complaints:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.render('HomeAdmin', { complaints: results, adminName: req.session.admin.name });
    });
});


module.exports = router;
