const express = require('express');

const { Category } = require('../models/category');
const { Product } = require('../models/product');

const router = express.Router();

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(categoryList);
});

router.get('/:id', async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res
      .status(500)
      .json({ message: 'The category with the given id is not found' });
  }
  return res.status(200).send(category);
});

router.post('/', async (req, res) => {
  let category = new Category({
    name: req.body.name.trim(),
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();

  if (!category) {
    return res.status(404).send('the category cannot be created!');
  }
  return res.send(category);
});

router.put('/:id', async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name.trim(),
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );
  if (!category) {
    return res.status(404).send('the category cannot be updated!');
  }
  return res.send(category);
});

router.delete('/:id', async (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: 'The category is deleted!' });
      }
      return res
        .status(404)
        .json({ success: false, message: 'Category not found!' });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
  const delproduct = await Product.deleteMany({ category: req.params.id });
});

module.exports = router;
