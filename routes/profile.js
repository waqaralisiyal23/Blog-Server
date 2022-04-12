const express = require('express');
const Profile = require('../models/profile.model');
const middleware = require('../middleware');

const router = express.Router();

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

module.exports = router;