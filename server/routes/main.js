const express = require('express');
const router = express.Router();
const Post = require('../models/post');
//router

router.get('/', async (req, res) => {

    try {
        const locals = {
            title: 'NodeJS Blog'
        }
        
        let perPage = 2;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: {createAt: -1}}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        res.render('index', {
            locals, 
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
            });
    } catch (error) {
        console.log(error);
    }
    
});


// router.get('/', async (req, res) => {
//     const locals = {
//         title: 'NodeJS Blog'
//     }

//     try {
//         const data = await Post.find();
//         res.render('index', {locals, data});
//     } catch (error) {
//         console.log(error);
//     }
    
// });

//GET POST ID
router.get('/post/:id', async (req, res) => {

    try {
        
        let slug = req.params.id;
        const data = await Post.findById({_id: slug});

        const locals = {
            title: data.title,
            currentRoute: `/posts/${slug}`
        }
        res.render('post', {locals, data});
    } catch (error) {
        console.log(error);
    }
    
});



router.get('/about', (req, res) => {
    res.render('about', {currentRoute: `/about`});
});


//Search
router.post('/search', async (req, res) => {

    try {
        const locals = {
            title: 'Search'
        }
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: searchNoSpecialChars, $options: 'i' } },
                { body: { $regex: searchNoSpecialChars, $options: 'i' } }
            ]
        });
        res.render('search', {
            data,
            locals,
        });
    } catch (error) {
        console.log(error);
    }
    
});

// function insertPost() {
//     Post.insertMany([
//         {
//             title: 'First Blog',
//             body: 'This is the first post on my blog'
//         },
//         {
//             title: 'Second Blog',
//             body: 'This is the second post on my blog'
//         },
//         {
//             title: 'Third Blog',
//             body: 'This is the third post on my blog'
//         }
//     ])
// }

//insertPost();

module.exports = router;