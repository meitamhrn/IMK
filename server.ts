import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "firewatch-secret-key-123";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    }
  });

  const PORT = 3000;

  // Mock Database in memory
  let users = [
    { id: 1, name: "Meita Maharani", email: "meita.ma@example.com", password: await bcrypt.hash("admin123", 10), role: "Admin", status: "Online" },
    { id: 2, name: "Riza Fauzi", email: "riza.f@example.com", password: await bcrypt.hash("user123", 10), role: "User", status: "Offline" },
  ];

  let devices = [
    { id: 1, name: "Raspberry Pi Area A", location: "Lobi Utara", status: "Aktif", lat: -6.2088, lng: 106.8456 },
    { id: 2, name: "Raspberry Pi Area B", location: "Ruang Server", status: "Aktif", lat: -6.2100, lng: 106.8480 },
    { id: 3, name: "Raspberry Pi Area C", location: "Kantin", status: "Non-aktif", lat: -6.2120, lng: 106.8440 },
  ];

  let sensorLogs = [
    { id: 1, deviceId: 1, deviceName: "Raspberry Pi Area A", timestamp: new Date().toISOString(), status: "Non-Fire", confidence: 0.98 },
  ];

  app.use(express.json());

  // Middleware for Auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } else {
      res.status(401).json({ message: "Email atau password salah" });
    }
  });

  app.get("/api/me", authenticateToken, (req: any, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Devices CRUD
  app.get("/api/devices", authenticateToken, (req, res) => {
    res.json(devices);
  });

  app.post("/api/devices", authenticateToken, (req, res) => {
    const newDevice = { ...req.body, id: Date.now() };
    devices.push(newDevice);
    res.status(201).json(newDevice);
  });

  app.put("/api/devices/:id", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const index = devices.findIndex(d => d.id === id);
    if (index !== -1) {
      devices[index] = { ...devices[index], ...req.body };
      res.json(devices[index]);
    } else {
      res.status(404).json({ message: "Device not found" });
    }
  });

  app.delete("/api/devices/:id", authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    devices = devices.filter(d => d.id !== id);
    res.status(204).end();
  });

  // Logs
  app.get("/api/logs", authenticateToken, (req, res) => {
    res.json(sensorLogs);
  });

  // Users CRUD (Admin only)
  app.get("/api/users", authenticateToken, (req: any, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
    const usersWithoutPasswords = users.map(({ password, ...u }) => u);
    res.json(usersWithoutPasswords);
  });

  app.post("/api/users", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), name, email, password: hashedPassword, role, status: "Offline" };
    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  });

  app.put("/api/users/:id", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      const { password, ...updateData } = req.body;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      users[index] = { ...users[index], ...updateData };
      const { password: _, ...userWithoutPassword } = users[index];
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  app.delete("/api/users/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "Admin") return res.status(403).json({ message: "Admin only" });
    const id = parseInt(req.params.id);
    users = users.filter(u => u.id !== id);
    res.status(204).end();
  });

  // Simulator: Emit random fire events every 10 seconds
  setInterval(() => {
    const activeDevices = devices.filter(d => d.status === "Aktif");
    if (activeDevices.length === 0) return;

    const randomDevice = activeDevices[Math.floor(Math.random() * activeDevices.length)];
    const isFire = Math.random() > 0.85; // 15% chance of fire
    
    const newLog = {
      id: sensorLogs.length + 1,
      deviceId: randomDevice.id,
      timestamp: new Date().toISOString(),
      status: isFire ? "Fire" : "Non-Fire",
      confidence: 0.7 + Math.random() * 0.29,
      deviceName: randomDevice.name
    };

    sensorLogs.unshift(newLog);
    if (sensorLogs.length > 100) sensorLogs.pop();

    io.emit("new-log", newLog);
    if (isFire) {
      io.emit("fire-alert", newLog);
    }
  }, 10000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
