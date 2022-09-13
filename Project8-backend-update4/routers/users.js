const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { User } = require('../models/user');
const { Order } = require('../models/order');

const router = express.Router();

router.get(`/`, async (req, res) => {
  const userList = await User.find().select('-passwordHash');
  if (!userList) {
    res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(userList);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) {
    return res
      .status(500)
      .json({ message: 'The user with the given id is not found' });
  } else {
    return res.status(200).send(user);
  }
});

router.post('/', async (req, res) => {
  console.log(req.body);
  let user = new User({
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street.trim(),
    apartment: req.body.apartment.trim(),
    zip: req.body.zip.trim(),
    city: req.body.city.trim(),
    country: req.body.country,
    userlocation: {
      type: 'Point',
      coordinates: [req.body.longitude, req.body.latitude],
    },
  });
  try {
    user = await user.save();
  } catch (error) {
    console.log(error);
    console.log(user, 'hello');
    return res.status(302).send('Email already exists.');
  }
  if (!user) {
    return res.status(404).send('the user cannot be created!');
  }
  console.log(user, 'hello');
  console.log('kjsdgh');
  return res.status(201).send(user);
});

router.put('/:id', async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street.trim(),
      apartment: req.body.apartment.trim(),
      zip: req.body.zip.trim(),
      city: req.body.city.trim(),
      country: req.body.country,
      // userlocation: {
      //   type: 'Point',
      //   coordinates: [req.body.longitude, req.body.latitude],
      // },
    },
    { new: true }
  );
  if (!user) {
    return res.status(404).send('the user cannot be updated!');
  }
  return res.send(user);
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.SECRET;

  if (!user) {
    return res.status(400).send('The user not found');
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      {
        expiresIn: '1d',
      }
    );
    return res.status(200).send({ user: user.email, token: token });
  } else {
    return res.status(400).send('Password is Wrong!');
  }
});

router.post('/register', async (req, res) => {
  console.log(req.body);
  let user = new User({
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street.trim(),
    apartment: req.body.apartment.trim(),
    zip: req.body.zip.trim(),
    city: req.body.city.trim(),
    country: req.body.country,
    userlocation: {
      type: 'Point',
      coordinates: [req.body.longitude, req.body.latitude],
    },
  });
  user = await user.save();
  console.log(user);

  if (!user) {
    return res.status(404).send('the user cannot be created!');
  }
  return res.send(user);
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid User id');
  }
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: 'The user is deleted!' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'User not found!' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
  const delOrders = await Order.deleteMany({ user: req.params.id });
});

router.get(`/get/count`, (req, res) => {
  User.countDocuments()
    .then((count) => {
      if (count) {
        return res.status(200).json({ userCount: count });
      } else {
        return res.status(500).json({ success: false });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

router.put('/locate/:id', async (req, res) => {
  console.log(req.params.id, 'this is id');
  console.log(req.body, 'this is body');
  // const userExist = await User.findById(req.params.id);
  // let newPassword;
  // if (req.body.password) {
  //   newPassword = bcrypt.hashSync(req.body.password, 10);
  // } else {
  //   newPassword = userExist.passwordHash;
  // }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      // name: req.body.name,
      // email: req.body.email,
      // passwordHash: newPassword,
      // phone: req.body.phone,
      // isAdmin: req.body.isAdmin,
      // street: req.body.street,
      // apartment: req.body.apartment,
      // zip: req.body.zip,
      // city: req.body.city,
      // country: req.body.country,
      userlocation: {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude],
      },
    },
    { new: true }
  );
  console.log(user);
  if (!user) {
    return res.status(404).send('the user cannot be updated!');
  } else {
    return res.send(user);
  }
});

module.exports = router;
