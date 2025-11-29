import { Router, Request, Response} from "express";
import Admin, { IAdmin } from "../models/Admin";




const router: Router = Router();





// POST register a new admin
router.post('/', async (req: Request, res:Response) => {
    try {
        // Set all admin have numeric IDs and find the highest one
        const adminId = await Admin.find({ id: { $exists:true, $type: 'number'}}).sort({ id: -1});
        const maxId = adminId.length > 0 ? Math.max(...adminId.map(a => a.id)) : 0;
        const nextId = maxId + 1;

        const adminData = {
            ...req.body,
            id: nextId
        };

        const newAdmin: IAdmin = new Admin (adminData);
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (error: any) {
        console.error('Error creating admin:', error);
        res.status(400).json({ message: error.message });
    }
});

export default router;