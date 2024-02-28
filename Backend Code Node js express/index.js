const express = require('express');
const cors = require('cors');
require('./config');
const userfileRef = require('./users');
const Product = require('./product');
const app = express();
app.use(cors());
app.use(express.json());
// In the post route, I am adding comments to understand properly the working of route
// Handling POST requests to the '/register' endpoint for registration signup
app.post('/register/', async (req, resp) => {
    // Creating a new user instance with the data from the request body
    let userRef = new userfileRef(req.body);
    // Saving the new user to the database
    let result = await userRef.save();
    // For the sign up registration API, removing the password in response
    result = result.toObject();
    delete result.password;
    console.log(result);
    // Sending the result back as the response
    resp.send(result);
})

// Route handler for user login
app.post('/login', async (req, resp) => {
    // Find the user based on the request body which typically contains user credentials
    if (req.body.email && req.body.password) {
        let user = await userfileRef.findOne(req.body).select("-password");
        // We should not include the password in the response to enhance security so select() used
        // Respond with the request body, which typically contains user credentials
        if (user) {
            resp.send(user);
            console.log(user)
        }
        // If we don't find the user then
        else {
            resp.send({ result: "User not found" });
        }

    } else {
        // If we have only one thing email or password, this would have feature to ask for both thing
        resp.send({ result: "Provide both email and password" });
    }
})
// making API for add product
app.post('/add-product', async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);

})

app.get('/products', async (req, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products);
    } else {
        resp.send({ result: "No products found" });
    }
})

app.delete('/product/:id', async (req, resp) => {
    const result = await Product.deleteOne({ _id: req.params.id });
    resp.send(result);
})

app.get('/product/:id', async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        resp.send(result);
    } else {
        resp.send({ "result": "No record found" })
    }
})
app.put('/product/:id', async (req, resp) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        { $set: req.body }
    )
    resp.send(result);
})
// This endpoint handles GET requests to search for products based on a key 
// Using $or operator to find documents where 'name' matches the regex pattern specified by the 'key' parameter
// Additional $or conditions can be added here if needed
app.get('/search/:key', async (req, resp) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } }
           

        ]
    });
    resp.send(result);
})

// If you want to search by multiple fields such as name and Company then this below code will be implemented
app.get('/search/:key', async (req, resp) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } }
        ]
    });
resp.send(result);
})
app.listen(3200);
//regex
// In JavaScript, the $regex operator is used in conjunction with MongoDB queries to perform pattern matching within documents. 
// It allows you to find documents where a particular field matches a specified regular expression pattern.
// { name: { $regex: req.params.key } } This MongoDB query is searching for documents in the Product collection 
// where the name field matches the regex pattern specified by req.params.key. 
// The $or operator in MongoDB allows you to perform a logical OR operation on an array of two or more expressions. 
// It's commonly used when you want to find documents that satisfy at least one of multiple conditions.

