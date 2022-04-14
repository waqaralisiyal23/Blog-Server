const express = require('express');
const Profile = require('../models/profile.model');
const middleware = require('../middleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {      // filename of file to be stored
        cb(null, req.decoded.username + '.jpg');
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6,
    },
    // fileFilter: fileFilter,
});

// adding/updating profile image
router.route('/add/image').patch(middleware.checkToken, upload.single('img'), (req, res) => {
    Profile.findOneAndUpdate(
        { username: req.decoded.username },
        {
            $set: {
                img: req.file.path,
            },
        },
        { new: true },
        (err, profile) => {
            if (err) return res.status(500).send(err);
            const response = {
                message: 'image added successfully',
                data: profile,
            };
            return res.status(200).send(response);
        }
    );
});

router.route('/add').post(middleware.checkToken, (req, res) => {
    const profile = Profile({
        username: req.decoded.username,
        name: req.body.name,
        profession: req.body.profession,
        DOB: req.body.DOB,
        titleline: req.body.titleline,
        about: req.body.about,
    });
    profile.save().then(() => {
        return res.json({ msg: 'Profile Successfully Saved' });
    }).catch((err) => {
        return res.status(400).json({ msg: err });
    });
});

router.route('/checkprofile').get(middleware.checkToken, (req, res) => {
    Profile.findOne({ username: req.decoded.username }, (err, result) => {
        if (err) return res.status(500).json({ msg: err });
        else if (result == null) {
            return res.json({ status: false, username: req.decoded.username });
        } else {
            return res.json({ status: true, username: req.decoded.username });
        }
    });
});

router.route('/getData').get(middleware.checkToken, (req, res) => {
    Profile.findOne({ username: req.decoded.username }, (err, result) => {
        if (err) return res.status(500).json({ msg: err });
        else if (result == null) return res.json({ data: [] });
        else return res.json({ data: result });
    });
});

router.route('/update').patch(middleware.checkToken, async (req, res) => {
    let profile = {};           // We will store old profile data in this
    await Profile.findOne({ username: req.decoded.username }, (err, result) => {
        if (err) {
            profile = {};
        }
        if (result != null) {
            profile = result;
        }
    });
    Profile.findOneAndUpdate(
        { username: req.decoded.username },
        {
            $set: {
                name: req.body.name ? req.body.name : profile.name,
                profession: req.body.profession
                    ? req.body.profession
                    : profile.profession,
                DOB: req.body.DOB ? req.body.DOB : profile.DOB,
                titleline: req.body.titleline ? req.body.titleline : profile.titleline,
                about: req.body.about ? req.body.about : profile.about, //about:""
            },
        },
        { new: true },
        (err, result) => {
            if (err) return res.status(500).json({ err: err });
            if (result == null) return res.json({ data: [] });
            else return res.json({ data: result });
        }
    );
});

module.exports = router;