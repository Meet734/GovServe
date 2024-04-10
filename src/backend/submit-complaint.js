// Import necessary packages
const express = require('express');
const mysql = require('mysql');

// Create Express app
const app = express();

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post('/submit-form', (req, res) => {
    const email = req.body.category;
    const complaint = req.body.complaint;
    const userId = req.session.userId;
    // Process the form data
    // Execute the SQL query to get the category ID based on the category name
    const query = 'SELECT category_id FROM categories WHERE category_name = ?';
    db.query(query, [categoryName], (err, result) => {
    if (err) {
        console.error('Error fetching category ID:', err);
        return;
    }

    if (result.length > 0) {
        // Category ID found
        const categoryId = result[0].category_id;
        //Add complaint into complaint table
        db.query('INSERT INTO complaints (user_id, category_id, content) VALUES (?, ?, ?)', [user_id, category_id, complaint], (err, result) => {
        if (err) {
            console.error('Error submitting complaint:', err);
            res.status(500).send('Error submitting complaint');
        } else {
            console.log('Complaint submitted successfully');
            res.status(200).send('Complaint submitted successfully');
        }
    });

    } else {
        // Category not found
        console.log('Category not found');
    }


});
  
    // Respond to the client
    res.send('Form data received successfully');
  });
  

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
