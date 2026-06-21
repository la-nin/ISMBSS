import {Router} from 'express';
import pool from "../db/database.js";
import {authenticateToken, AuthenticatedRequest} from "../middleware/auth.js";

const router = Router();

// router.get('/services', authenticateToken, async (req, res, next) => {
//     try {
//         const authReq = req as AuthenticatedRequest;

//         if (authReq.user?.role !== 'client') {
//             res.status(403).json({
//                 message: 'Only clients'
//             }
//             )
//         }
