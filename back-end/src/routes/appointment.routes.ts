import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../db/database.js";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

type ClientRow = RowDataPacket & {
  id: number;
};

type ServiceRow = RowDataPacket & {
  id: number;
  salon_id: number;
  duration_minutes: number;
};

async function getClientIdByUserId(userId: number) {
  const [rows] = await pool.query<ClientRow[]>(
    "SELECT id FROM clients WHERE user_id = ? LIMIT 1",
    [userId],
  );

  return rows[0]?.id;
}

function addMinutesToTime(startTime: string, minutes: number) {
  const [hours, mins] = startTime.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, mins);

  date.setMinutes(date.getMinutes() + minutes);

  return date.toTimeString().slice(0, 8);
}

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (authReq.user?.role !== "client") {
      return res
        .status(403)
        .json({ message: "Only clients may access this route" });
    }

    const { service_id, appointment_date, start_time } = req.body;

    if (!service_id || !appointment_date || !start_time) {
      return res.status(400).json({
        message: "Service id, date and time are required",
      });
    }

    const clientId = await getClientIdByUserId(parseInt(authReq.user.userId));

    if (!clientId) {
      return res.status(404).json({ message: "Client not found" });
    }

    const [services] = await pool.query<ServiceRow[]>(
      `SELECT id, salon_id, duration_minutes
            FROM service
            WHERE id = ? LIMIT 1`,
      [service_id],
    );

    const service = services[0];

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const startTime = start_time.length === 5 ? `${start_time}:00` : start_time;
    const endTime = addMinutesToTime(startTime, service.duration_minutes);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO appointment
            (client_id, salon_id, worker_id, service_id, discount_package_id, appointment_date, start_time, end_time, status, created_at, cancelled_at)
            VALUES (?, ?, NULL, ?, NULL, ?, ?, ?, 'booked', CURRENT_TIMESTAMP, NULL)`,
      [
        clientId,
        service.salon_id,
        service.id,
        appointment_date,
        startTime,
        endTime,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Appointment booked succesfully",
      appointmentId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
