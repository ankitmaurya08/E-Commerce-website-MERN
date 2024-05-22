const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 8000;
require("./database/db");

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use('/public', express.static('public'));


app.use(session({
    secret: 'token_added',
    resave: false,
    saveUninitialized: true,
}));

const Product = require('./routeAPI/product');
const Users = require('./routeAPI/user');

const authenticateUser = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

const validateSessionToken = (req, res, next) => {
    const token = req.session.token;
    if (token) {
        jwt.verify(token, 'token_added', (err, user) => {
            if (err) {
                return res.status(401).send('Invalid token');
            }
            req.session.user = user;
            next();
        });
    } else {
        next();
    }
};

app.use(validateSessionToken);

app.post('/checkLoginStatus', (req, res) => {
    if (req.session.user) {
        console.log(req.session.user);
        res.json({ isLoggedIn: true, user: req.session.user, redirect: "/"});
    } else {
        res.json({ isLoggedIn: false });
    }
});


// Routes
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/cart/:_id', authenticateUser, async (req, res) => {
    const user_id = req.params._id;

    try {
        const user = await Users.findOne({ _id: user_id });
        // console.log(user);
        if (!user) {
            return res.status(404).send('User not found');
        }
        let cart=0;
        const productInfoArray = [];
        for (const cartitem of user.cart) {
            const productInfo = await Product.findOne({ _id: cartitem.productId });
            
            cart++;
            if (productInfo) {
                productInfoArray.push({
                    productId: cartitem.productId,
                    productUrl: productInfo.producturl,
                    size: cartitem.size,
                    quantity: cartitem.quantity
                  });
            }
        }
        console.log(productInfoArray);
        res.render('cart', { items: productInfoArray, cartno: cart });
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/quantity', async (req,res)=>{
    const updatedCartItem = req.body;
    console.log(updatedCartItem);
    const user = req.session.user;
    console.log(user);

})

app.post('/addToCart', authenticateUser, async (req, res) => {
    try {
        const cartDetail = req.body;
        console.log(cartDetail);
        const user = req.session.user;
        console.log(user)

        await Users.updateOne(
            { "_id": user.userId },
            { $push: { "cart": {productId: cartDetail.product_Id, size: 'M', quantity: '2'} } }
        );

        console.log('Item added to cart successfully');
        res.json({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/product/:_id', async (req, res) => {
    // res.render('category');
    const product_id = req.params._id;

    try {
        const product = await Product.find({ _id: product_id });
        console.log(product);
        res.render('product', { items: product });
    } catch (error) {
        console.error('Error retrieving products:', error);
    }
});

app.get('/category/:name', async (req, res) => {
    const cat = req.params.name;
    let category = cat.toUpperCase();

    try {
        const items = await Product.find({ category: cat });
        console.log('items:', items);
        res.render('category', { cat: category, items: items });
    } catch (error) {
        console.error('Error retrieving items:', error);
    }
});


app.post('/setproduct', (req, res) => {
    console.log(req.body);
    const product = new Product(req.body);
    product.save().then(
        () => console.log('Product saved successfully')
    ).catch(
        err => console.error(err)
    );
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.post('/register', async (req, res) => {
    const {username, phone, email, address, password } = req.body;
    
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const newUser = new Users({
            name: username,
            email: email,
            phone: phone,
            address: address,
            password: hashedPassword,
        });
        console.log(newUser);

        await newUser.save();
        console.log("Registration successful")
        res.json({ message: 'Registration successful', login:"true" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await Users.findOne({ email: username });
        
        function getTotalItems(cart) {
            return cart.reduce((total, product) => total + product, 0);
        }
        const totalItems = getTotalItems(user.cart);

        console.log(totalItems);

        if (user && bcrypt.compareSync(password, user.password)) {
        
            const token = jwt.sign({ username: user.name, userId: user._id }, 'token_added');
            req.session.user = { username: user.name, userId: user._id };
            req.session.token = token;
            
            res.json({ message: 'Login successful', token, redirect:'/' });
            console.log(username);
            // res.redirect('/');
        } else {

            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ message: 'Logout successful',  redirect: '/' } );

        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
