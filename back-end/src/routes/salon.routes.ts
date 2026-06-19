import { Router } from "express";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../db/database.js";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

type SalonRow = RowDataPacket & {
  id: number;
};

async function getSalonIdByUserId(userId: number) {
  const [rows] = await pool.query<SalonRow[]>(
    "SELECT id FROM salons WHERE user_id = ? LIMIT 1",
    [userId],
  );

  return rows[0]?.id;
}

router.get("/services", authenticateToken, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user?.role !== "salon") {
      return res
        .status(403)
        .json({ message: "Only salons can access this route" });
    }

    const salonId = await getSalonIdByUserId(parseInt(authReq.user.userId));

    if (!salonId) {
      return res.status(404).json({ message: "Salon not found" });
    }

    const [services] = await pool.execute(
      `SELECT id, service_name, description, duration_minutes, base_price, full_price, is_active, image_url
            FROM service`,
    );

    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/services",
  authenticateToken,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const authReq = req as AuthenticatedRequest;

      if (authReq.user?.role !== "salon") {
        return res
          .status(403)
          .json({ message: "Only salons can access this route" });
      }

      const salonId = await getSalonIdByUserId(parseInt(authReq.user.userId));

      if (!salonId) {
        return res.status(404).json({ message: "Salon not found" });
      }

      const {
        service_name,
        description,
        duration_minutes,
        base_price,
        full_price,
      } = req.body;

      if (!service_name || !duration_minutes || !base_price || !full_price) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO service (salon_id, service_name, description, duration_minutes, base_price, full_price, is_active, image_url)
      VALUES (?,?,?,?,?,?,true,?)`,
        [
          salonId,
          service_name,
          description || null,
          duration_minutes,
          base_price,
          full_price,
          image_url || null,
        ],
      );

      res.status(201).json({
        success: true,
        message: "Service created successfully",
        serviceId: result.insertId,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
