import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import { errorHandler } from "./shared/middleware/errorHandler.js";
import { NotFoundError } from "./shared/errors/NotFoundError.js";
import { createAuthMiddleware } from "./auth/infrastructure/authMiddleware.js";
import { requireRole } from "./auth/infrastructure/requireRole.js";
import { BcryptHasher } from "./shared/infrastructure/BcryptHasher.js";
import { JwtService } from "./auth/infrastructure/JwtService.js";
import { PrismaUserRepository } from "./user/infrastructure/PrismaUserRepository.js";
import { PrismaCredentialRepository } from "./auth/infrastructure/PrismaCredentialRepository.js";
import { RegisterUserUseCase } from "./user/application/use-cases/RegisterUserUseCase.js";
import { GetUserProfileUseCase } from "./user/application/use-cases/GetUserProfileUseCase.js";
import { LoginUseCase } from "./auth/application/use-cases/LoginUseCase.js";
import { RefreshTokenUseCase } from "./auth/application/use-cases/RefreshTokenUseCase.js";
import { LogoutUseCase } from "./auth/application/use-cases/LogoutUseCase.js";
import { UserController } from "./user/infrastructure/UserController.js";
import { AuthController } from "./auth/infrastructure/AuthController.js";
import { createUserRouter } from "./user/infrastructure/UserRouter.js";
import { createAuthRouter } from "./auth/infrastructure/AuthRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5500",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const passwordHasher = new BcryptHasher();
const tokenService = new JwtService();
const userRepository = new PrismaUserRepository();
const credentialRepository = new PrismaCredentialRepository();

const authMiddleware = createAuthMiddleware(tokenService);

const registerUserUseCase = new RegisterUserUseCase({ userRepository, passwordHasher });
const getUserProfileUseCase = new GetUserProfileUseCase({ userRepository });
const loginUseCase = new LoginUseCase({ credentialRepository, passwordHasher, tokenService });
const refreshTokenUseCase = new RefreshTokenUseCase({ tokenService, userRepository });
const logoutUseCase = new LogoutUseCase();

const userController = new UserController({ registerUserUseCase, getProfileUseCase: getUserProfileUseCase });
const authController = new AuthController({ loginUseCase, refreshTokenUseCase, logoutUseCase });

const userRouter = createUserRouter({ userController, authMiddleware, requireRole });
const authRouter = createAuthRouter({ authController });

const publicPath = path.join(__dirname, "..", "..", "frontend", "public");
const adminPath = path.join(__dirname, "..", "..", "frontend", "admin");
const sharedPath = path.join(__dirname, "..", "..", "frontend", "shared");

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/admin", express.static(adminPath));
app.use("/shared", express.static(sharedPath));
app.use("/", express.static(publicPath));

app.use((req, res, next) => {
  next(new NotFoundError('Route not found.'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Public frontend:  http://localhost:${PORT}`);
  console.log(`Admin panel:      http://localhost:${PORT}/admin`);
  console.log(`Shared resources: http://localhost:${PORT}/shared`);
  console.log(`API health:       http://localhost:${PORT}/api/health`);
  console.log(`Auth router:      http://localhost:${PORT}/api/auth`);
  console.log(`User router:      http://localhost:${PORT}/api/users`);
});
