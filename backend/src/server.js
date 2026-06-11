import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];
const missing = requiredEnvVars.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

import { errorHandler } from "./shared/middleware/errorHandler.js";
import { NotFoundError } from "./shared/errors/NotFoundError.js";
import { createAuthMiddleware } from "./shared/middleware/authMiddleware.js";
import { requireRole } from "./shared/middleware/requireRole.js";
import { BcryptHasher } from "./auth/infrastructure/BcryptHasher.js";
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

import { PrismaBookRepository } from "./book/infrastructure/PrismaBookRepository.js";
import { CreateBookUseCase } from "./book/application/use-cases/CreateBookUseCase.js";
import { ListBooksUseCase } from "./book/application/use-cases/ListBooksUseCase.js";
import { GetBookUseCase } from "./book/application/use-cases/GetBookUseCase.js";
import { UpdateBookUseCase } from "./book/application/use-cases/UpdateBookUseCase.js";
import { DeleteBookUseCase } from "./book/application/use-cases/DeleteBookUseCase.js";
import { BookController } from "./book/infrastructure/BookController.js";
import { createBookRouter } from "./book/infrastructure/BookRouter.js";

import { PrismaAuthorRepository } from "./author/infrastructure/PrismaAuthorRepository.js";
import { CreateAuthorUseCase } from "./author/application/use-cases/CreateAuthorUseCase.js";
import { ListAuthorsUseCase } from "./author/application/use-cases/ListAuthorsUseCase.js";
import { GetAuthorUseCase } from "./author/application/use-cases/GetAuthorUseCase.js";
import { UpdateAuthorUseCase } from "./author/application/use-cases/UpdateAuthorUseCase.js";
import { DeleteAuthorUseCase } from "./author/application/use-cases/DeleteAuthorUseCase.js";
import { AuthorController } from "./author/infrastructure/AuthorController.js";
import { createAuthorRouter } from "./author/infrastructure/AuthorRouter.js";

import { PrismaCategoryRepository } from "./category/infrastructure/PrismaCategoryRepository.js";
import { CreateCategoryUseCase } from "./category/application/use-cases/CreateCategoryUseCase.js";
import { ListCategoriesUseCase } from "./category/application/use-cases/ListCategoriesUseCase.js";
import { GetCategoryUseCase } from "./category/application/use-cases/GetCategoryUseCase.js";
import { UpdateCategoryUseCase } from "./category/application/use-cases/UpdateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "./category/application/use-cases/DeleteCategoryUseCase.js";
import { CategoryController } from "./category/infrastructure/CategoryController.js";
import { createCategoryRouter } from "./category/infrastructure/CategoryRouter.js";

// ─── Cart ───────────────────────────────────────────────
import { PrismaCartRepository } from "./cart/infrastructure/PrismaCartRepository.js";
import { GetCartUseCase } from "./cart/application/GetCartUseCase.js";
import { AddToCartUseCase } from "./cart/application/AddToCartUseCase.js";
import { UpdateCartItemUseCase } from "./cart/application/UpdateCartItemUseCase.js";
import { RemoveCartItemUseCase } from "./cart/application/RemoveCartItemUseCase.js";
import { CartController } from "./cart/infrastructure/CartController.js";
import { createCartRouter } from "./cart/infrastructure/CartRouter.js";

// ─── Order ──────────────────────────────────────────────
import { PrismaOrderRepository } from "./order/infrastructure/PrismaOrderRepository.js";
import { CreateOrderUseCase } from "./order/application/CreateOrderUseCase.js";
import { GetUserOrdersUseCase } from "./order/application/GetUserOrdersUseCase.js";
import { GetOrderDetailUseCase } from "./order/application/GetOrderDetailUseCase.js";
import { ListAllOrdersUseCase } from "./order/application/ListAllOrdersUseCase.js";
import { UpdateOrderStatusUseCase } from "./order/application/UpdateOrderStatusUseCase.js";
import { GetStatsUseCase } from "./order/application/GetStatsUseCase.js";
import { OrderController } from "./order/infrastructure/OrderController.js";
import { createOrderRouter } from "./order/infrastructure/OrderRouter.js";
import { AdminOrderController } from "./order/infrastructure/AdminOrderController.js";
import { createAdminOrderRouter } from "./order/infrastructure/AdminOrderRouter.js";

// ─── Payment ────────────────────────────────────────────
import { PrismaPaymentRepository } from "./payment/infrastructure/PrismaPaymentRepository.js";
import { StripePaymentGateway } from "./payment/infrastructure/StripePaymentGateway.js";
import { HandleStripeWebhookUseCase } from "./payment/application/HandleStripeWebhookUseCase.js";
import { VerifyPaymentUseCase } from "./payment/application/VerifyPaymentUseCase.js";
import { PaymentController } from "./payment/infrastructure/PaymentController.js";
import { createPaymentRouter } from "./payment/infrastructure/PaymentRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : "http://localhost:5500"),
  credentials: true,
}));
app.use(cookieParser());

// Stripe webhook — raw body required; register before express.json
app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), (req, res, next) => {
  paymentController.handleWebhook(req, res).catch(next);
});

app.use(express.json());

const passwordHasher = new BcryptHasher();
const tokenService = new JwtService();
const userRepository = new PrismaUserRepository();
const credentialRepository = new PrismaCredentialRepository();

const authorRepository = new PrismaAuthorRepository();
const categoryRepository = new PrismaCategoryRepository();
const bookRepository = new PrismaBookRepository();

const cartRepository = new PrismaCartRepository();
const orderRepository = new PrismaOrderRepository();
const paymentRepository = new PrismaPaymentRepository();
const stripeGateway = new StripePaymentGateway();

const authMiddleware = createAuthMiddleware(tokenService);

const registerUserUseCase = new RegisterUserUseCase({ userRepository, passwordHasher });
const getUserProfileUseCase = new GetUserProfileUseCase({ userRepository });
const loginUseCase = new LoginUseCase({ credentialRepository, passwordHasher, tokenService });
const refreshTokenUseCase = new RefreshTokenUseCase({ tokenService, userRepository });
const logoutUseCase = new LogoutUseCase();

const userController = new UserController({ registerUserUseCase, getProfileUseCase: getUserProfileUseCase });
const authController = new AuthController({ loginUseCase, refreshTokenUseCase, logoutUseCase });

const createAuthorUseCase = new CreateAuthorUseCase({ authorRepository });
const listAuthorsUseCase = new ListAuthorsUseCase({ authorRepository });
const getAuthorUseCase = new GetAuthorUseCase({ authorRepository });
const updateAuthorUseCase = new UpdateAuthorUseCase({ authorRepository });
const deleteAuthorUseCase = new DeleteAuthorUseCase({ authorRepository });
const authorController = new AuthorController({ createAuthorUseCase, listAuthorsUseCase, getAuthorUseCase, updateAuthorUseCase, deleteAuthorUseCase });

const createCategoryUseCase = new CreateCategoryUseCase({ categoryRepository });
const listCategoriesUseCase = new ListCategoriesUseCase({ categoryRepository });
const getCategoryUseCase = new GetCategoryUseCase({ categoryRepository });
const updateCategoryUseCase = new UpdateCategoryUseCase({ categoryRepository });
const deleteCategoryUseCase = new DeleteCategoryUseCase({ categoryRepository });
const categoryController = new CategoryController({ createCategoryUseCase, listCategoriesUseCase, getCategoryUseCase, updateCategoryUseCase, deleteCategoryUseCase });

const createBookUseCase = new CreateBookUseCase({ bookRepository, authorRepository, categoryRepository });
const listBooksUseCase = new ListBooksUseCase({ bookRepository });
const getBookUseCase = new GetBookUseCase({ bookRepository });
const updateBookUseCase = new UpdateBookUseCase({ bookRepository, authorRepository, categoryRepository });
const deleteBookUseCase = new DeleteBookUseCase({ bookRepository });
const bookController = new BookController({ createBookUseCase, listBooksUseCase, getBookUseCase, updateBookUseCase, deleteBookUseCase });

// ─── Cart ───────────────────────────────────────────────
const getCartUseCase = new GetCartUseCase({ cartRepository });
const addToCartUseCase = new AddToCartUseCase({ cartRepository, bookRepository });
const updateCartItemUseCase = new UpdateCartItemUseCase({ cartRepository });
const removeCartItemUseCase = new RemoveCartItemUseCase({ cartRepository });
const cartController = new CartController({ getCartUseCase, addToCartUseCase, updateCartItemUseCase, removeCartItemUseCase });

// ─── Order ──────────────────────────────────────────────
const createOrderUseCase = new CreateOrderUseCase({ cartRepository, bookRepository, orderRepository, paymentRepository, stripeGateway });
const getUserOrdersUseCase = new GetUserOrdersUseCase({ orderRepository });
const getOrderDetailUseCase = new GetOrderDetailUseCase({ orderRepository });
const orderController = new OrderController({ createOrderUseCase, getUserOrdersUseCase, getOrderDetailUseCase });

const listAllOrdersUseCase = new ListAllOrdersUseCase({ orderRepository });
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase({ orderRepository });
const getStatsUseCase = new GetStatsUseCase({ orderRepository, bookRepository });
const adminOrderController = new AdminOrderController({ listAllOrdersUseCase, updateOrderStatusUseCase, getStatsUseCase });

// ─── Payment ────────────────────────────────────────────
const handleStripeWebhookUseCase = new HandleStripeWebhookUseCase({ paymentRepository, orderRepository });
const verifyPaymentUseCase = new VerifyPaymentUseCase({ stripeGateway, paymentRepository });
const paymentController = new PaymentController({ stripeGateway, handleStripeWebhookUseCase, verifyPaymentUseCase });

const userRouter = createUserRouter({ userController, authMiddleware, requireRole });
const authRouter = createAuthRouter({ authController });
const authorRouter = createAuthorRouter({ authorController, authMiddleware, requireRole });
const categoryRouter = createCategoryRouter({ categoryController, authMiddleware, requireRole });
const bookRouter = createBookRouter({ bookController, authMiddleware, requireRole });
const cartRouter = createCartRouter({ cartController, authMiddleware });
const orderRouter = createOrderRouter({ orderController, authMiddleware });
const adminOrderRouter = createAdminOrderRouter({ adminOrderController, authMiddleware, requireRole });
const paymentRouter = createPaymentRouter({ paymentController });

const publicPath = path.join(__dirname, "..", "..", "frontend", "public");
const adminPath = path.join(__dirname, "..", "..", "frontend", "admin");
const sharedPath = path.join(__dirname, "..", "..", "frontend", "shared");

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/authors", authorRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/books", bookRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/payments", paymentRouter);

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
  const mode = process.env.NODE_ENV || 'development';
  console.log(`\n  FERVOR Bookstore — http://localhost:${PORT} (${mode})\n`);
});
