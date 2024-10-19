const express = require('express');
const router = express.Router();
const post = require('../models/post');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin'


const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ msg: 'Not authenticated' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = decoded.id; 
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Not authenticated' });
    }
};



router.get('/admin', async (req, res) => {
    

    try {
        const locals = {
            title: 'Admin Page'
        }
        res.render('admin/index', {locals, layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
    
});

//Check login
// router.post('/admin', async (req, res) => {
    

//     try {
//         const {username, password} = req.body;
        
//         if (req.body.username === 'admin' && req.body.password === '123456') {
//             res.send('Welcome');
//         } else {
//             res.send('Invalid username or password');
//         }

//         res.redirect('/admin');
//     } catch (error) {
//         console.log(error);
//     }
    
// });

router.post('/admin', async (req, res) => {
    

    try {
        const {username, password} = req.body;
        
        const user = await User.findOne({username});
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username or password'});
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {httpOnly: true});

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
    
});

//Middleware 
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Dashboard'
        }

        const data = await post.find();
        res.render('admin/dashboard', {locals, data, layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});

//Create New Blog
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Add Post'
        }

        const data = await post.find();
        res.render('admin/add-post', {locals, layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});

router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        const newPost = new post({
            title: req.body.title,
            body: req.body.body
        })
        await post.create(newPost);
        //res.render('admin/add-post', {locals, layout: adminLayout});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

//Edit Post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: 'Edit Post'
        }

        const data = await post.findOne({_id: req.params.id});
        res.render('admin/edit-post', {locals, data, layout: adminLayout});

    } catch (error) {
        console.log(error);
    }
});

router.put('/edit-post/:id', async (req, res) => {
    try {
        const { title, body } = req.body;
        const postId = req.params.id;

        // Assuming you're using a Post model
        await post.findByIdAndUpdate(postId, { title, body });

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
});

//Delete Post
router.delete('/delete-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        // Assuming you're using a Post model
        await post.findByIdAndDelete(postId);

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
});


//Register
router.post('/register', async (req, res) => {
    

    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username: username, password: hashedPassword });
            res.status(201).json({ message: 'User created successfully'});
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'Username already exists'});
            }
            res.status(500).json({ message: 'Server error'});
        }

        
    } catch (error) {
        console.log(error);
    }
    
});

//Logout
router.get('/logout', async (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful' });
    res.redirect('/');
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        currentRoute: '/'
    });
});

module.exports = router;