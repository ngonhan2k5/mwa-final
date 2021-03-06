const express = require('express');
const Product = require('../models/product');
const router = express.Router();
const multer = require('multer');
const multerGoogleStorage = require("multer-google-storage");

let file_name;

const uploadHandler = multer({
  storage: multerGoogleStorage.storageEngine({
    filename: function (req, file, cb) {
      file_name = Date.now() + '_' + file.originalname;
      cb(null, file_name);
    }
  })
});

//save new product
router.post('/', uploadHandler.single('file'), (req, res) => {
  const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file_name}`;
  // res.status(200).send(`Success!\n Image uploaded to ${publicUrl}`);
  let newProduct = new Product(req.body)
  newProduct.photo = publicUrl
  newProduct.save()
  res.json({
    msg: 'New product created',
    data: newProduct
  })
});

//Get all products
router.get('/', (req, res) => {
  Product.find({}, ((err, data) => res.json({
    data: data
  })))
})


//Get product by Id
router.get('/:id', async (req, res) => {
  const productId = req.params.id
  const product = await Product.findOne({
    _id: productId
  }, (err, data) => res.json({
    data: data
  }))
})


//Update product by id
router.put('/:id', uploadHandler.single('file'), async (req, res) => {
  const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${file_name}`;
  console.log(publicUrl)
  const productId = req.params.id
  const product = await Product.findOne({
    _id: productId
  })
  product.name = req.body.name
  product.description = req.body.description
  product.price = req.body.price
  product.photo = publicUrl
  product.inStock = req.body.inStock

  let result = await product.save()
  res.json({
    data: result,
    message: "Product updated Successful"
  })

});

// Delete a product
router.delete('/:id', async (req, res) => {
  const productId = req.params.id;
  let query = { _id: productId }
  const productCount = await Product.countDocuments(query)

  if (productCount == 1) {
    console.log(productCount)
    Product.deleteOne(query).then(function () {
      console.log("Data deleted");
      res.send({
        message: "Product is deleted"
      })
    }).catch(function (error) {
      console.log(error);
    });
  } else {
    res.status(400).json({
      error: 'Not existing: Product is already Deleted'

    })
  }
})

module.exports = router;