import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
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
