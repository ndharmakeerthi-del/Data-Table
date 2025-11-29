import { Router, Request, Response } from "express";
import Product from "../models/Product";
import { authenticateToken } from '../middleware/auth';
import { success } from "zod";




const router: Router = Router();

// Apply authentication to all product routes (both user and admin can access)
router.use(authenticateToken);


// GET all products
// router.get('/', async (_req: any, res: any) => {
//     const products = await Product.find();
//     res.json(products);
// })


// GET paginated products with optional search
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
        const search = req.query.search as string;
        const skip = (page - 1) * limit;

        console.log('Product API called with params:', { page, limit, search });

        // Build query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } }
                ]
            }
        }

        // Get total count
        const totalProducts = await Product.countDocuments(query);

        // Get paginated results
        const products = await Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ id: 1 }); // Sort by ID instead

        const totalPages = Math.ceil(totalProducts / limit);

        return res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching paginated products:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
})


// POST create a new product
router.post('/', async (req: Request, res: Response) =>{
    try {
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const nextId = lastProduct ? lastProduct.id + 1 : 1;

        const productData = {
            ...req.body,
            id: nextId
        };

        const newProduct = new Product(productData);
        await newProduct.save();

        res.status(201).json({
            success: true,
            data: newProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create product'
        })
    }
});

// PUT update a product
router.put('/:id', async (req: Request, res: Response) => {
    
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findOneAndUpdate(
            { id: parseInt(id) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to update product' 
        });
    }
});

// DELETE a product
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findOneAndDelete({ id: parseInt(id) });

        if (!deletedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
            data: deletedProduct
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get a single product by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ id: Number(id) });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
})

export default router;
