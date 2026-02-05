import express from 'express';
import {addProduct,listProduct,removeProduct,singleProduct} from '../controllers/productController.js';
import upload from '../middleware/multer.js';

const productRouter= express.Router();

//route for adding product
productRouter.post('/add',upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);

//route for listing products
productRouter.get('/list',listProduct);

//route for removing product
productRouter.delete('/remove/:id',removeProduct);
productRouter.post('/remove', removeProduct);

//route for single product info
productRouter.get('/single',singleProduct);
productRouter.post('/single', singleProduct);

export default productRouter;