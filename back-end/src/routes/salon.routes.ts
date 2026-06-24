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

router.get("/services", async (req, res, next) => {
  try {
    const [services] = await pool.execute(
      `SELECT service.id AS id, service.service_name, service.description, service.duration_minutes, service.base_price, service.full_price, service.is_active, service.image_url, salons.salon_name
            FROM service
            JOIN salons ON service.salon_id = salons.id`,
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

router.get("/discount-packages", authenticateToken, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user?.role != "salon") {
      return res
        .status(403)
        .json({ message: "Only salon users can access this route" });
    }

    const salonId = await getSalonIdByUserId(parseInt(authReq.user.userId));

    if (!salonId) {
      return res.status(404).json({ message: "salon not found" });
    }

    const [packages] = await pool.execute(
      `SELECT id, title, description,
      package_price, start_date, end_date, is_active
      FROM discount_package
      WHERE salon_id = ?`,
      [salonId],
    );

    res.json({ success: true, packages });
  } catch (error) {
    next(error);
  }
});

router.post("/discount-packages", authenticateToken, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user?.role !== "salon") {
      return res
        .status(403)
        .json({ message: "Only salons can access this route" });
    }

    const salonId = await getSalonIdByUserId(parseInt(authReq.user.userId));

    if (!salonId) {
      return res.status(404).json({ message: "salon not found" });
    }

    const { title, description, package_price, start_date, end_date } =
      req.body;

    // const discount_value = discount_percentage === "" ? null : Number(discount_percentage)
    // const package_value = package_price === "" ? null : Number(package_price)

    if (!title || !start_date || !end_date || !package_price) {
      return res.status(400).json({
        message: "fill in the required fields: title, start date, end date.",
      });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO discount_package (
      salon_id,
      title,
      description,
      package_price,
      start_date,
      end_date,
      is_active
      ) VALUES (?,?,?,?,?,?,TRUE)`,
      [
        salonId,
        title,
        description || null,
        package_price,
        start_date,
        end_date,
      ],
    );
    res.status(201).json({
      success: true,
      message: "Discount package sucessfully created",
      packageId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/profile", authenticateToken, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user?.role !== "salon") {
      return res
        .status(403)
        .json({ message: "Only salons can visit this route" });
    }

    const userId = parseInt(authReq.user.userId);
    const salonId = await getSalonIdByUserId(userId);

    if (!salonId) {
      return res.status(404).json({ message: "Salon not found" });
    }

    const {
      salon_name,
      description,
      address,
      city,
      cancellation_days_limit,
      email,
      phone_number,
    } = req.body;

    if (!salon_name || !email || !phone_number || !address || !city) {
      return res.status(400).json({
        message: "Enter salon name, email, phone number, address, city",
      });
    }

    await pool.execute(
      `UPDATE salons
       SET 
        salon_name = ?,
        description = ?,
        address = ?,
        city = ?,
        cancellation_days_limit = ?
       WHERE id = ?`,
      [
        salon_name,
        description || null,
        address,
        city,
        cancellation_days_limit || 0,
        salonId,
      ],
    );

    await pool.execute(
      `UPDATE users
      SET email = ?,
      phone_number = ?
      WHERE id = ?`,
      [email, phone_number, userId],
    );

    res.json({
      success: true,
      message: "Salon profile updated",
    });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This email is already used" });
    }

    next(error);
  }
});

router.get("/profile", authenticateToken, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user?.role !== "salon") {
      return res
        .status(403)
        .json({ message: "Only a salon user can visit this route" });
    }

    const salonId = await getSalonIdByUserId(parseInt(authReq.user.userId));

    if (!salonId) {
      return res.status(403).json({ message: "Salon not found" });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
      salons.id,
      salons.salon_name,
      salons.description,
      salons.address,
      salons.city,
      salons.cancellation_days_limit,
      salons.is_verified,
      users.email,
      users.phone_number
      FROM salons
      JOIN users ON salons.user_id = users.id
      WHERE salons.id = ?`,
      [salonId],
    );

    res.json({ success: true, profile: rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
