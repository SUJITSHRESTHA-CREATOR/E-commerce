const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  keywords: [
    {
      type: String,
      required: true,
    },
  ],
  richDescription: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  priceMax: {
    type: Number,
    required: true,
  },
  priceMin: {
    type: Number,
  },
  viewsId: [
    {
      type: String,
    },
  ],
  viewsCount: {
    type: Number,
    default: 0,
  },
  thresholdCount: {
    type: Number,
    required: true,
  },
  timeRecorded: {
    type: String,
  },
  timeCount: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  reviews: {
    type: [
      {
        name: String,
        review: String,
      },
    ],
    default: undefined,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  geography: {
    type: String,
    default: 'No',
  },
  location: {
    type: {
      type: String,
      enum: ['Polygon'],
    },
    coordinates: {
      type: [[[Number]]],
      default: undefined,
    },
  },
  pgeography: {
    type: String,
    default: 'No',
  },
  plocation: {
    type: {
      type: String,
      enum: ['Polygon'],
    },
    coordinates: {
      type: [[[Number]]],
      default: undefined,
    },
  },
});

productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

productSchema.set('toJSON', { virtuals: true });

exports.Product = mongoose.model('Product', productSchema);
