import { Router, Request, Response } from "express";
import LocalProduct from "../models/LocalProduct";
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// Health check endpoint (no auth required)
router.get('/health', async (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Local Products API is running' });
});

// Apply authentication to all other local product routes (both user and admin can access)
router.use(authenticateToken);

// GET paginated local products with optional search
router.get('/', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
        const search = req.query.search as string;
        const skip = (page - 1) * limit;

        console.log('Local Product API called with params:', { page, limit, search });

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
        const totalProducts = await LocalProduct.countDocuments(query);

        // Get paginated results
        const products = await LocalProduct.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ id: 1 }); // Sort by ID

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
        console.error('Error fetching paginated local products:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// POST create a new local product
router.post('/', async (req: Request, res: Response) => {
    try {
        const lastProduct = await LocalProduct.findOne().sort({ id: -1 });
        const nextId = lastProduct ? lastProduct.id + 1 : 1;

        const productData = {
            ...req.body,
            id: nextId
        };

        const newProduct = new LocalProduct(productData);
        await newProduct.save();

        res.status(201).json({
            success: true,
            data: newProduct
        });
    } catch (error) {
        console.error('Error creating local product:', error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create local product'
        });
    }
});

// PUT update a local product
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedProduct = await LocalProduct.findOneAndUpdate(
            { id: parseInt(id) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Local product not found' 
            });
        }

        res.json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error updating local product:', error);
        res.status(400).json({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to update local product' 
        });
    }
});

// DELETE a local product
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedProduct = await LocalProduct.findOneAndDelete({ id: parseInt(id) });

        if (!deletedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Local product not found' 
            });
        }

        res.json({
            success: true,
            message: 'Local product deleted successfully',
            data: deletedProduct
        });
    } catch (error) {
        console.error('Error deleting local product:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get a single local product by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await LocalProduct.findOne({ id: Number(id) });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Local product not found' });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching local product:', error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;