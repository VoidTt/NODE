import express from "express";
import bcrypt from "bcrypt";
import { getDatabase } from "../database/database.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    const { login, password } = req.body ?? {};

    if (!login || !password) {
        return res.status(400).json({
            status: "error"
        });
    }

    const db = await getDatabase();

    const user = await db.get(
        "SELECT * FROM users WHERE login = ?",
        [login]
    );

    if (!user) {
        return res.status(401).json({
            status: "error"
        });
    }

    const valid = await bcrypt.compare(
        password,
        user.password
    );

    if (!valid) {
        return res.status(401).json({
            status: "error"
        });
    }

    res.status(200).json({
        status: "success"
    });
});

router.post("/register", async (req, res) => {
    const { login, password } = req.body ?? {};

    if (!login || !password) {
        return res.status(400).json({
            status: "error"
        });
    }

    const db = await getDatabase();

    const exists = await db.get(
        "SELECT id FROM users WHERE login = ?",
        [login]
    );

    if (exists) {
        return res.status(409).json({
            status: "error"
        });
    }

    const hash = await bcrypt.hash(password, 12);

    await db.run(
        "INSERT INTO users(login, password) VALUES(?, ?)",
        [login, hash]
    );

    res.status(200).json({
        status: "success"
    });
});

export default router;