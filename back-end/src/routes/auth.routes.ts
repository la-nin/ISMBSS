import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../db/database.js";

type UserRow = RowDataPacket & {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone_number: string;
  role: "client" | "salon" | "admin" | "worker";
  is_active: number;
};

const router = Router();

router.post("/signup", async (req, res, next) => {
  const {
    role,
    first_name,
    last_name,
    email,
    password,
    phone_number,
    salon_name,
    description,
    address,
    city,
    cancellation_days_limit,
    salon_id,
    specialization,
  } = req.body;

  if (!["client", "salon"].includes(role)) {
    res.status(400).json({ message: "Choose client or salon" });
    return;
  }

  if (!first_name || !last_name || !email || !password || !phone_number) {
    res.status(400).json({ message: "Fill in the required fields" });
    return;
  }

  if (role === "salon" && (!salon_name || !address || !city)) {
    res.status(400).json({ message: "Enter the required fields" });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(500).json({
      message: "JWT secret missing",
    });
    return;
  }

  const connection = await pool.getConnection();

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const [userResult] = await pool.execute<ResultSetHeader>(
      `INSERT INTO users
       (first_name, last_name, email, password_hash, phone_number, role) VALUES (?,?,?,?,?,?)`,
      [first_name, last_name, email, password_hash, phone_number, role],
    );

    const userId = userResult.insertId;

    if (role === "client") {
      await pool.execute(`INSERT INTO clients (user_id) VALUES (?)`, [userId]);
    }

    if (role === "salon") {
      await pool.execute(
        `INSERT INTO salons (user_id, salon_name, description, address, city, cancellation_days_limit) VALUES (?,?,?,?,?,?)`,
        [
          userId,
          salon_name,
          description || null,
          address,
          city,
          cancellation_days_limit || 0,
        ],
      );
    }

    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: userId,
        first_name,
        last_name,
        email,
        phone_number,
        role,
      },
    });
  } catch (error: unknown) {
    await connection.rollback();

    next(error);
  } finally {
    connection.release();
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const [rows] = await pool.execute<UserRow[]>(
      `SELECT id, first_name, last_name, email, password_hash, phone_number, role, is_active 
            FROM users
            WHERE email = ?
            LIMIT 1`,
      [email],
    );

    const user = rows[0];

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: "Inactive account",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid password",
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: "JWT secret missing",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
