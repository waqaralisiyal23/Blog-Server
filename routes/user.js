const express = require('express');
const User = require('../models/users.model');
const config = require('../config');
const middleware = require('../middleware');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.route('/:username').get(middleware.checkToken, (req, res) => {
    User.findOne(
        { username: req.params.username },
        (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            const msg = {
                data: result,
                username: req.params.username,
            };
            return res.json(msg);
        }
    );
});

router.route('/checkusername/:username').get((req, res) => {
    User.findOne(
        { username: req.params.username },
        (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            if (result === null) {
                return res.json({ status: false });
            } else {
                return res.json({ status: true });
            }
        }
    );
});

router.route('/login').post((req, res) => {
    User.findOne(
        { username: req.body.username },
        (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            if (result === null) {
                return res.status(403).json({ msg: 'Incorrect Username' });
            }
            if (result.password === req.body.password) {
                // here we implement the JWT token
                let token = jwt.sign(
                    { username: req.body.username },
                    config.key,
                    {},
                );
                res.json({
                    token: token,
                    msg: 'success',
                });
            } else {
                res.status(403).json({ msg: 'Incorrect Password' });
            }
        }
    );
});

router.route('/register').post((req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    });
    user.save().then(() => {
        let token = jwt.sign(
            { username: req.body.username },
            config.key,
            {},
        );
        res.json({
            token: token,
            msg: 'success',
        });
    }).catch((err) => {
        res.status(403).json({ msg: err });
    });
});

router.route('/update/:username').patch(middleware.checkToken, (req, res) => {
    User.findOneAndUpdate(
        { username: req.params.username },
        { $set: { password: req.body.password } },
        (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            const msg = {
                msg: 'Password successfully updated.',
                username: req.params.username,
            };
            return res.json(msg);
        }
    );
});

router.route('/delete/:username').delete(middleware.checkToken, (req, res) => {
    User.findOneAndDelete(
        { username: req.params.username },
        (err, result) => {
            if (err) return res.status(500).json({ msg: err });
            const msg = {
                msg: 'User Deleted.',
                username: req.params.username,
            };
            return res.json(msg);
        }
    );
});

module.exports = router;