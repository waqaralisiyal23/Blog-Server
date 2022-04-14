
const express = require('express');
const BlogPost = require('../models/blogpost.model');
const middleware = require('../middleware');
const multer = require('multer');
const { json } = require('express/lib/response');

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {                      // filename of file to be stored
        cb(null, req.params.id + '.jpg');
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6,
    },
});

router.route('/add/coverImage/:id').patch(middleware.checkToken, upload.single('img'), (req, res) => {
    BlogPost.findOneAndUpdate(
        { _id: req.params.id },
        {
            $set: {
                coverImage: req.file.path,
            },
        },
        { new: true },
        (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            return res.json(result);
        }
    );
});

router.route('/add').post(middleware.checkToken, (req, res) => {
    const blogpost = BlogPost({
        username: req.decoded.username,
        title: req.body.title,
        body: req.body.body,
    });
    blogpost
        .save()
        .then((result) => {
            res.json({ data: result['_id'] });
        })
        .catch((err) => {
            res.status(500).json({ msg: err });
        });
});

router.route('/getOwnBlogs').get(middleware.checkToken, (req, res) => {
    BlogPost.find({ username: req.decoded.username }, (err, result) => {
        if (err) return res.status(500).json({ msg: err });
        if (result == null) return res.json({ data: [] });
        return res.json({ data: result });
    });
});

router.route('/getOtherBlogs').get(middleware.checkToken, (req, res) => {
    BlogPost.find({ username: { $ne: req.decoded.username } }, (err, result) => {
        if (err) return res.status(500).json({ msg: err });
        if (result == null) return res.json({ data: [] });
        return res.json({ data: result });
    });
});

router.route('/delete/:id').delete(middleware.checkToken, (req, res) => {
    BlogPost.findOneAndDelete(
        {
            $and: [{ username: req.decoded.username }, { _id: req.params.id }],
        },
        (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            else if (result) {
                return res.json({ msg: 'Blog deleted' });
            }
            return res.json({ msg: 'Blog not deleted' });
        }
    );
});

module.exports = router;