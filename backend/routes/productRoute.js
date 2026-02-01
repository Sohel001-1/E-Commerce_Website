import express from 'express';
import {addProduct,listProduct,removeProduct,singleProduct} from '../controllers/productController.js';
import upload from '../middlewares/multer.js';

const productRouter= express.Router();

//route for adding product
productRouter.post('/add-product',upload.field([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);

//route for listing products
productRouter.get('/list-products',listProduct);

//route for removing product
productRouter.delete('/remove-product/:id',removeProduct);

//route for single product info
productRouter.get('/single-product/:id',singleProduct);

export default productRouter;