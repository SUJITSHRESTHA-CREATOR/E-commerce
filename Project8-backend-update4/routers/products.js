const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const { Product } = require('../models/product');
const { Category } = require('../models/category');
const { User } = require('../models/user');

const router = express.Router();

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  // console.log(req.query.categories);
  if (req.headers.authorization) {
    const extraction = req.headers.authorization.split(' ')[1];
    const extraction1 = atob(extraction.split('.')[1]);
    const extraction1Parsed = JSON.parse(extraction1);
    // console.log(typeof extraction1Parsed);
    // console.log(extraction1Parsed);
    const uid = extraction1Parsed.userId;
    // console.log('user id is', uid);

    const user = await User.findById(uid).select('-passwordHash');
    if (!user) {
      return res
        .status(500)
        .json({ message: 'The user with the given id is not found' });
    }
    const latitude = user.userlocation.coordinates[1];
    const longitude = user.userlocation.coordinates[0];
    // console.log(longitude, latitude, '----------------------------');

    if (req.headers.authorization && !extraction1Parsed.isAdmin) {
      // console.log('Entered because normal customers');
      // let filter = {
      //   $or: [
      //     {
      //       location: {
      //         $geoIntersects: {
      //           $geometry: {
      //             type: 'Point',
      //             coordinates: [longitude, latitude],
      //           },
      //         },
      //       },
      //     },
      //     { geography: 'No' },
      //   ],
      // };
      // console.log(longitude, latitude);
      let filter = {
        $or: [
          {
            location: {
              $geoIntersects: {
                $geometry: {
                  type: 'Point',
                  coordinates: [longitude, latitude],
                },
              },
            },
          },
          { geography: 'No' },
        ],
      };
      // let filter = {};

      if (req.query.categories) {
        filter = {
          $and: [
            {
              category: req.query.categories.split(','),
            },
            {
              $or: [
                {
                  location: {
                    $geoIntersects: {
                      $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                      },
                    },
                  },
                },
                { geography: 'No' },
              ],
            },
          ],
        };
        // const filter = {
        //   category: req.query.categories.split(','),
        // };
        // const filterF = {
        //   $or: [
        //     {
        //       location: {
        //         $geoIntersects: {
        //           $geometry: {
        //             type: 'Point',
        //             coordinates: [longitude, latitude],
        //           },
        //         },
        //       },
        //     },
        //     { geography: 'No' },
        //   ],
        // };
        //  const productListQ = await Product.find(filterQ).populate('category');
        // const productListFinal=await Product.find(filter)
      }

      // console.log(filter, 'Filter for normal customers');
      // const heyy = {
      //   type: 'Point',
      //   coordinates: [longitude, latitude],
      // };
      const productList = await Product.find(filter).populate('category');
      // const productList = await Product.find({
      // geography: 'Yes',
      // location: {
      //   $geoIntersects: {
      //     // $geometry: {
      //     //   type: 'Point',
      //     //   coordinates: [longitude, latitude],
      //     // },
      //     $geometry: heyy,
      //   },
      // },
      // }).populate('category');
      // const productList = await Product.find({})
      //   .where('location')
      //   .intersects()
      //   .geometry({
      //     type: 'Point',
      //     coordinates: [longitude, latitude],
      //   })
      //   .populate('category');
      // console.log('Product List', productList, 'This is product list');
      if (!productList) {
        // console.log('No product list');
        res.status(500).json({
          success: false,
        });
      } else {
        res.send(productList);
      }
    } else {
      // console.log('Entered because admin');
      let filter = {};
      if (req.query.categories) {
        filter = {
          category: req.query.categories.split(','),
        };
      }
      // console.log(filter);
      const productList = await Product.find(filter).populate('category');
      if (!productList) {
        res.status(500).json({
          success: false,
        });
      }
      res.send(productList);
    }
  } else {
    // console.log('Entered because not logged in');
    let filter = {};
    if (req.query.categories) {
      filter = {
        category: req.query.categories.split(','),
      };
    }
    // console.log(filter);
    const productList = await Product.find(filter).populate('category');
    if (!productList) {
      res.status(500).json({
        success: false,
      });
    }
    res.send(productList);
  }
});

router.get(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  if (req.headers.authorization) {
    const extraction = req.headers.authorization.split(' ')[1];
    const extraction1 = atob(extraction.split('.')[1]);
    const extraction1Parsed = JSON.parse(extraction1);
    // console.log(typeof extraction1Parsed);
    // console.log(extraction1Parsed);
    const uid = extraction1Parsed.userId;

    if (req.headers.authorization && !extraction1Parsed.isAdmin) {
      // if (req.headers.authorization) {
      console.log('user id is', uid);
      // const targetUser=await User.findById(uid);
      // const user = await User.findById(uid).select('-passwordHash');

      // const longi = user.userlocation.coordinates[0];
      // const lati = user.userlocation.coordinates[1];
      // console.log(longi, lati);
      const updatedProduct = await Product.findById(req.params.id);
      console.log(
        updatedProduct,
        '---------------------------------------------------------------------'
      );
      const valid = updatedProduct.plocation.coordinates;

      if (valid) {
        const p1 = [
          updatedProduct.plocation.coordinates[0][0][0],
          updatedProduct.plocation.coordinates[0][0][1],
        ];
        const p2 = [
          updatedProduct.plocation.coordinates[0][1][0],
          updatedProduct.plocation.coordinates[0][1][1],
        ];
        const p3 = [
          updatedProduct.plocation.coordinates[0][2][0],
          updatedProduct.plocation.coordinates[0][2][1],
        ];
        const p4 = [
          updatedProduct.plocation.coordinates[0][3][0],
          updatedProduct.plocation.coordinates[0][3][1],
        ];
        const filter = {
          userlocation: {
            $geoWithin: {
              $geometry: {
                type: 'Polygon',
                coordinates: [[p1, p2, p3, p4, p1]],
              },
            },
          },
        };
        const thatUsers = await User.find(filter);
        console.log(thatUsers);
        if (thatUsers) {
          let convertedArray;
          if (thatUsers.length === undefined) {
            convertedArray = [thatUsers];
          } else {
            convertedArray = thatUsers;
          }
          const answer = convertedArray.find((elem) => {
            return elem.id === uid;
          });
          if (answer) {
            const numTimeRecorded = +updatedProduct.timeRecorded;
            console.log('Time recorded is', numTimeRecorded);
            // console.log(typeof numTimeRecorded, numTimeRecorded);
            console.log('Timecount is', updatedProduct.timeCount);
            const addSec = updatedProduct.timeCount * 1000;
            console.log('Addition second is', addSec);
            const futureTime = numTimeRecorded + addSec;
            console.log('Time future is', futureTime);
            console.log(Date.now() > futureTime);

            if (Date.now() > futureTime) {
              console.log(
                'updated product.priceMin is',
                updatedProduct.priceMin
              );
              updatedProduct.price = updatedProduct.priceMin;
              updatedProduct.timeRecorded = '';
              updatedProduct.viewsCount = 0;
              console.log(updatedProduct.viewsCount);
              updatedProduct.viewsId = [];
            }

            const found = updatedProduct.viewsId.find((id) => {
              return id === uid;
            });

            if (!found) {
              updatedProduct.viewsId.push(uid);
              console.log('pushed is', updatedProduct.viewsId);
              updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
              updatedProduct.timeRecorded = Date.now().toString();
            } else {
              // updatedProduct.viewsId.push(uid);
              // updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
              updatedProduct.timeRecorded = Date.now().toString();
            }

            if (updatedProduct.viewsCount > updatedProduct.thresholdCount) {
              console.log('viewscount current', updatedProduct.viewsCount);
              console.log(
                'thresholdcount current',
                updatedProduct.thresholdCount
              );
              console.log('Max price is', updatedProduct.priceMax);
              updatedProduct.price = updatedProduct.priceMax;
            }

            // console.log(typeof updatedProduct, updatedProduct);
            // const found = updatedProduct.viewsId.find((id) => {
            //   return id === uid;
            // });
            // const numTimeRecorded = +updatedProduct.timeRecorded;
            // console.log('Time recorded is', numTimeRecorded);
            // // console.log(typeof numTimeRecorded, numTimeRecorded);
            // console.log('Timecount is', updatedProduct.timeCount);
            // const addSec = updatedProduct.timeCount * 1000;
            // console.log('Addition second is', addSec);
            // const futureTime = numTimeRecorded + addSec;
            // console.log('Time future is', futureTime);
            // console.log(Date.now() > futureTime);
            // if (Date.now() > futureTime) {
            //   console.log('updated product.priceMin is', updatedProduct.priceMin);
            //   updatedProduct.price = updatedProduct.priceMin;
            //   updatedProduct.timeRecorded = '';
            //   updatedProduct.viewsCount = 0;
            //   console.log(updatedProduct.viewsCount);
            //   updatedProduct.viewsId = '';
            //   updatedProduct.viewsId.push(uid);
            //   updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
            //   updatedProduct.timeRecorded = Date.now().toString();
            //   console.log('Executred Time greater');
            // }
            // if (!found) {
            //   updatedProduct.viewsId.push(uid);
            //   console.log('pushed is', updatedProduct.viewsId);
            //   updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
            //   updatedProduct.timeRecorded = Date.now().toString();
            // } else {
            //   // updatedProduct.viewsId.push(uid);
            //   // updatedProduct.viewsCount = updatedProduct.viewsCount + 1;
            //   updatedProduct.timeRecorded = Date.now().toString();
            //   if (updatedProduct.viewsCount > updatedProduct.thresholdCount) {
            //     updatedProduct.price = updatedProduct.priceMax;
            //   }
            // }

            // console.log(updatedProduct);
            const storeProduct = await Product.findByIdAndUpdate(
              req.params.id,
              {
                // name: req.body.name,
                // description: req.body.description,
                // richDescription: req.body.richDescription,
                // image: imagePath,
                // brand: req.body.brand,
                price: updatedProduct.price,
                // priceMax: req.body.priceMax,
                // priceMin: req.body.price,
                // thresholdCount: req.body.thresholdCount,
                // timeCount: req.body.timeCount,
                // category: req.body.category,
                // countInStock: req.body.countInStock,
                // rating: req.body.rating,
                // numReviews: req.body.numReviews,
                // isFeatured: req.body.isFeatured,
                timeRecorded: updatedProduct.timeRecorded,
                viewsCount: updatedProduct.viewsCount,
                viewsId: updatedProduct.viewsId,
              },
              { new: true }
            );
            console.log(storeProduct);
            // console.log(typeof uid, uid);
            const product = await Product.findById(req.params.id);
            if (!product) {
              return res.status(500).json({
                success: false,
              });
            } else {
              return res.send(product);
            }
          } else {
            const productDefault = await Product.findById(req.params.id);
            productDefault.price = productDefault.priceMin;
            const storeProduct1 = await Product.findByIdAndUpdate(
              req.params.id,
              {
                price: productDefault.price,
              },
              { new: true }
            );
            console.log(storeProduct1);
            const productFinal = await Product.findById(req.params.id);
            if (!productFinal) {
              return res.status(500).json({
                success: false,
              });
            } else {
              return res.send(productFinal);
            }
          }
        } else {
          const productDefault = await Product.findById(req.params.id);
          productDefault.price = productDefault.priceMin;
          const storeProduct1 = await Product.findByIdAndUpdate(
            req.params.id,
            {
              price: productDefault.price,
            },
            { new: true }
          );
          console.log(storeProduct1);
          const productFinal = await Product.findById(req.params.id);
          if (!productFinal) {
            return res.status(500).json({
              success: false,
            });
          } else {
            return res.send(productFinal);
          }
        }
      } else {
        const productDefault = await Product.findById(req.params.id);
        productDefault.price = productDefault.priceMin;
        const storeProduct1 = await Product.findByIdAndUpdate(
          req.params.id,
          {
            price: productDefault.price,
          },
          { new: true }
        );
        console.log(storeProduct1);
        const productFinal = await Product.findById(req.params.id);
        if (!productFinal) {
          return res.status(500).json({
            success: false,
          });
        } else {
          return res.send(productFinal);
        }
      }

      // console.log(typeof req.params.id);
    } else {
      const productDefault = await Product.findById(req.params.id);
      productDefault.price = productDefault.priceMin;
      const storeProduct1 = await Product.findByIdAndUpdate(
        req.params.id,
        {
          price: productDefault.price,
        },
        { new: true }
      );
      console.log(storeProduct1);
      const productFinal = await Product.findById(req.params.id);
      if (!productFinal) {
        return res.status(500).json({
          success: false,
        });
      } else {
        return res.send(productFinal);
      }
    }
  } else {
    const productDefault = await Product.findById(req.params.id);
    productDefault.price = productDefault.priceMin;
    const storeProduct1 = await Product.findByIdAndUpdate(
      req.params.id,
      {
        price: productDefault.price,
      },
      { new: true }
    );
    console.log(storeProduct1);
    const productFinal = await Product.findById(req.params.id);
    if (!productFinal) {
      return res.status(500).json({
        success: false,
      });
    } else {
      return res.send(productFinal);
    }
  }

  // const product = await Product.findById(req.params.id);
  // if (!product) {
  //   res.status(500).json({
  //     success: false,
  //   });
  // } else {
  //   res.send(product);
  // }
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const file = req.file;
  if (!file) {
    return res.status(400).send('No image in the request');
  }

  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  const fileName = req.file.filename;

  const product1 = new Product({
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    keywords: req.body.keywords.split(','),
    richDescription: req.body.richDescription.trim(),
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    priceMax: req.body.priceMax,
    priceMin: req.body.price,
    thresholdCount: req.body.thresholdCount,
    timeCount: req.body.timeCount,
    // timeRecorded:new Date(),
    // viewsCount:req.body.viewsCount,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    geography: 'No',
    location: {},
    pgeography: 'No',
    plocation: {},
  });
  const product = await product1.save();
  if (!product) {
    return res.status(500).send({
      message: 'Product cannot be created',
    });
  }
  return res.status(201).send(product);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const productPrevious = await Product.findById(req.params.id);
  if (!productPrevious) {
    return res.status(400).send('Invalid Product!');
  }

  const file = req.file;

  let imagePath;
  if (file) {
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const fileName = req.file.filename;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = productPrevious.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      keywords: req.body.keywords.split(','),
      richDescription: req.body.richDescription.trim(),
      image: imagePath,
      brand: req.body.brand,
      price: req.body.price,
      priceMax: req.body.priceMax,
      priceMin: req.body.price,
      thresholdCount: req.body.thresholdCount,
      timeCount: req.body.timeCount,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      // location: {
      //   type: 'Polygon',
      //   coordinates: [
      //     [
      //       [req.body.a1, req.body.a2],
      //       [req.body.b1, req.body.b2],
      //       [req.body.c1, req.body.c2],
      //       [req.body.d1, req.body.d2],
      //       [req.body.a1, req.body.a2],
      //     ],
      //   ],
      // },
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(500).send('the product cannot be updated!');
  } else {
    return res.send(updatedProduct);
  }
});

router.put('/geo/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const productPrevious = await Product.findById(req.params.id);
  if (!productPrevious) {
    return res.status(400).send('Invalid Product!');
  }

  // const file = req.file;

  // let imagePath;
  // if (file) {
  //   const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  //   const fileName = req.file.filename;
  //   imagePath = `${basePath}${fileName}`;
  // } else {
  //   imagePath = productPrevious.image;
  // }
  // console.log('Entering Calculation');
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        // name: req.body.name,
        // description: req.body.description,
        // richDescription: req.body.richDescription,
        // image: imagePath,
        // brand: req.body.brand,
        // price: req.body.price,
        // priceMax: req.body.priceMax,
        // priceMin: req.body.price,
        // thresholdCount: req.body.thresholdCount,
        // timeCount: req.body.timeCount,
        // category: req.body.category,
        // countInStock: req.body.countInStock,
        // rating: req.body.rating,
        // numReviews: req.body.numReviews,
        // isFeatured: req.body.isFeatured,
        geography: 'Yes',
        location: {
          type: 'Polygon',
          coordinates: [
            [
              [req.body.a1, req.body.a2],
              [req.body.b1, req.body.b2],
              [req.body.c1, req.body.c2],
              [req.body.d1, req.body.d2],
              [req.body.a1, req.body.a2],
            ],
          ],
        },
      },
      { new: true }
    );

    console.log('Calculation Finished');

    console.log(updatedProduct);
    if (!updatedProduct) {
      return res.status(500).send('the product cannot be updated!');
    } else {
      return res.send(updatedProduct);
    }
  } catch (error) {
    return res.status(500).send('the product cannot be updated!');
  }
});

router.put('/delgeo/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const productPrevious = await Product.findById(req.params.id);
  if (!productPrevious) {
    return res.status(400).send('Invalid Product!');
  }

  // const file = req.file;

  // let imagePath;
  // if (file) {
  //   const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
  //   const fileName = req.file.filename;
  //   imagePath = `${basePath}${fileName}`;
  // } else {
  //   imagePath = productPrevious.image;
  // }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      // name: req.body.name,
      // description: req.body.description,
      // richDescription: req.body.richDescription,
      // image: imagePath,
      // brand: req.body.brand,
      // price: req.body.price,
      // priceMax: req.body.priceMax,
      // priceMin: req.body.price,
      // thresholdCount: req.body.thresholdCount,
      // timeCount: req.body.timeCount,
      // category: req.body.category,
      // countInStock: req.body.countInStock,
      // rating: req.body.rating,
      // numReviews: req.body.numReviews,
      // isFeatured: req.body.isFeatured,
      geography: 'No',
      location: {
        // type: 'Polygon',
        // coordinates: [[[]]],
      },
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(500).send('the product cannot be updated!');
  }
  return res.send(updatedProduct);
});

router.put('/geop/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const productPrevious = await Product.findById(req.params.id);
  if (!productPrevious) {
    return res.status(400).send('Invalid Product!');
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        pgeography: 'Yes',
        plocation: {
          type: 'Polygon',
          coordinates: [
            [
              [req.body.pa1, req.body.pa2],
              [req.body.pb1, req.body.pb2],
              [req.body.pc1, req.body.pc2],
              [req.body.pd1, req.body.pd2],
              [req.body.pa1, req.body.pa2],
            ],
          ],
        },
      },
      { new: true }
    );

    console.log(updatedProduct);
    if (!updatedProduct) {
      return res.status(500).send('the product cannot be updated!');
    } else {
      return res.send(updatedProduct);
    }
  } catch (error) {
    return res.status(500).send('the product cannot be updated!');
  }
});

router.put('/delgeop/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const productPrevious = await Product.findById(req.params.id);
  if (!productPrevious) {
    return res.status(400).send('Invalid Product!');
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      pgeography: 'No',
      plocation: {
        // type: 'Polygon',
        // coordinates: [[[]]],
      },
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(500).send('the product cannot be updated!');
  }
  return res.send(updatedProduct);
});

router.delete('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: 'The product is deleted!' });
      }
      return res
        .status(404)
        .json({ success: false, message: 'Product not found!' });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get(`/get/count`, (req, res) => {
  Product.countDocuments()
    .then((count) => {
      if (count) {
        return res.status(200).json({ productCount: count });
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

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  if (req.headers.authorization) {
    const extraction = req.headers.authorization.split(' ')[1];
    const extraction1 = atob(extraction.split('.')[1]);
    const extraction1Parsed = JSON.parse(extraction1);
    // console.log(typeof extraction1Parsed);
    console.log(extraction1Parsed);
    const uid = extraction1Parsed.userId;
    console.log('user id is', uid);

    const user = await User.findById(uid).select('-passwordHash');
    if (!user) {
      return res
        .status(500)
        .json({ message: 'The user with the given id is not found' });
    }
    const latitude = user.userlocation.coordinates[1];
    const longitude = user.userlocation.coordinates[0];

    if (req.headers.authorization && !extraction1Parsed.isAdmin) {
      const products = await Product.find({
        $and: [
          { isFeatured: true },
          {
            $or: [
              {
                location: {
                  $geoIntersects: {
                    $geometry: {
                      type: 'Point',
                      coordinates: [longitude, latitude],
                    },
                  },
                },
              },
              { geography: 'No' },
            ],
          },
        ],
      }).limit(+count);
      if (!products) {
        return res.status(500).json({
          success: false,
        });
      } else {
        return res.send(products);
      }
    } else {
      const products = await Product.find(
        //  $and: [
        { isFeatured: true }
      ).limit(+count);
      if (!products) {
        return res.status(500).json({
          success: false,
        });
      } else {
        return res.send(products);
      }
    }
  } else {
    const products = await Product.find(
      //  $and: [
      { isFeatured: true }
    ).limit(+count);
    if (!products) {
      return res.status(500).json({
        success: false,
      });
    } else {
      return res.send(products);
    }
  }
});

router.put(
  '/gallery-images/:id',
  uploadOptions.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send('Invalid Product id');
    }
    const files = req.files;

    let imagesPath = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPath.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPath,
      },
      { new: true }
    );

    if (!product) {
      return res.status(500).send('the product cannot be updated!');
    }
    return res.send(product);
  }
);

router.put('/review/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }
  console.log(req.body.reviews);
  console.log(req.params.id);
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      $push: { reviews: req.body.reviews },
    },
    { new: true }
  );
  console.log(updatedProduct);
  if (!updatedProduct) {
    return res.status(500).send('the product cannot be updated!');
  } else {
    return res.send(updatedProduct);
  }
});

router.put('/rating/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid Product id');
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send('Invalid Category');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      rating: req.body.rating,
      numReviews: req.body.numReviews,
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(500).send('the product cannot be updated!');
  } else {
    return res.send(updatedProduct);
  }
});

module.exports = router;
