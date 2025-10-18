const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { json } = require('body-parser');


router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } 
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id',async (req,res)=>{
  try{
    await Product.findByIdAndDelete(req.params.id);
    res.json({message:'product deleted successfully'});

  }catch (err){
    res.status(500).json ({error:err.message});
  }
})

module.exports = router;

router.post('/order', async (req, res) => {
  try {
    console.log("Order received:", req.body);
    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});