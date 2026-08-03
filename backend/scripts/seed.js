import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

// ─── Data ────────────────────────────────────────────────

const ADMIN_USER = {
  name: "Admin FERVOR",
  email: "admin@fervor.store",
  tel: "+57 300 000 0000",
  role: "ADMIN",
  password: "Admin1234!",
};

const CLIENT_USER = {
  name: "Juan Perez",
  email: "juan@fervor.store",
  tel: "+57 310 000 0000",
  role: "CLIENT",
  password: "Client1234!",
};

const AUTHORS = [
  { name: "Gabriel García Márquez" },
  { name: "Julio Cortázar" },
  { name: "Isabel Allende" },
  { name: "Jorge Luis Borges" },
  { name: "Pablo Neruda" },
  { name: "Elena Poniatowska" },
  { name: "Roberto Bolaño" },
  { name: "Clarice Lispector" },
];

const CATEGORIES = [
  { name: "Novela" },
  { name: "Poesía" },
  { name: "Ensayo" },
  { name: "Cuento" },
  { name: "Crónica" },
  { name: "Infantil" },
];

const BOOKS = [
  {
    name: "Cien años de soledad",
    price: 45000,
    stock: 25,
    language: "Español",
    publicationDate: "1967-05-30",
    description:
      "La obra maestra de García Márquez. La historia de la familia Buendía a lo largo de siete generaciones en el pueblo ficticio de Macondo.",
    authorName: "Gabriel García Márquez",
    categoryName: "Novela",
  },
  {
    name: "Rayuela",
    price: 38000,
    stock: 18,
    language: "Español",
    publicationDate: "1963-06-28",
    description:
      "Una novela experimental que puede leerse de múltiples maneras. Horacio Oliveira recorre París y Buenos Aires.",
    authorName: "Julio Cortázar",
    categoryName: "Novela",
  },
  {
    name: "La casa de los espíritus",
    price: 42000,
    stock: 20,
    language: "Español",
    publicationDate: "1982",
    description:
      "La saga de la familia Trueba a través de cuatro generaciones, entrelazada con la historia política de Chile.",
    authorName: "Isabel Allende",
    categoryName: "Novela",
  },
  {
    name: "Ficciones",
    price: 35000,
    stock: 15,
    language: "Español",
    publicationDate: "1944",
    description:
      "Una colección de cuentos que desafían la realidad y la lógica. Borges crea laberintos metafísicos.",
    authorName: "Jorge Luis Borges",
    categoryName: "Cuento",
  },
  {
    name: "Veinte poemas de amor y una canción desesperada",
    price: 28000,
    stock: 30,
    language: "Español",
    publicationDate: "1924",
    description:
      "El poemario más leído de la lengua española. Neruda explora el amor, la pérdida y la naturaleza.",
    authorName: "Pablo Neruda",
    categoryName: "Poesía",
  },
  {
    name: "Pedro Páramo",
    price: 32000,
    stock: 12,
    language: "Español",
    publicationDate: "1955",
    description:
      "Juan Preciado viaja a Comala en busca de su padre y encuentra un pueblo habitado por murmullos.",
    authorName: "Juan Rulfo",
    categoryName: "Novela",
  },
  {
    name: "Aura",
    price: 25000,
    stock: 20,
    language: "Español",
    publicationDate: "1962",
    description:
      "Una novela corta de Carlos Fuentes. Felipe Montero acepta un trabajo misterioso en una casa colonial.",
    authorName: "Carlos Fuentes",
    categoryName: "Novela",
  },
  {
    name: "El Aleph",
    price: 36000,
    stock: 14,
    language: "Español",
    publicationDate: "1949",
    description:
      "Una colección de cuentos donde Borges explora el infinito, los espejos y las bibliotecas universales.",
    authorName: "Jorge Luis Borges",
    categoryName: "Cuento",
  },
  {
    name: "Residencia en la tierra",
    price: 30000,
    stock: 16,
    language: "Español",
    publicationDate: "1933",
    description:
      "Poemas que capturan la soledad cósmica y la condición humana con imágenes poderosas.",
    authorName: "Pablo Neruda",
    categoryName: "Poesía",
  },
  {
    name: "La ciudad y los perros",
    price: 40000,
    stock: 10,
    language: "Español",
    publicationDate: "1963",
    description:
      "La novela inaugural de Mario Vargas Llosa. Un retrato crudo de la vida en el Colegio Militar Leoncio Prado.",
    authorName: "Mario Vargas Llosa",
    categoryName: "Novela",
  },
  {
    name: "Paula",
    price: 33000,
    stock: 22,
    language: "Español",
    publicationDate: "1994",
    description:
      "Memorias de Isabel Allende escritas durante la enfermedad y muerte de su hija Paula.",
    authorName: "Isabel Allende",
    categoryName: "Crónica",
  },
  {
    name: "El amor en los tiempos del cólera",
    price: 41000,
    stock: 19,
    language: "Español",
    publicationDate: "1985",
    description:
      "Florentino Ariza espera más de cincuenta años para estar con Fermina Daza. Una historia de amor persistente.",
    authorName: "Gabriel García Márquez",
    categoryName: "Novela",
  },
];

// ─── Seed ────────────────────────────────────────────────

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function upsertUser(data) {
  const passwordHash = await hashPassword(data.password);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      name: data.name,
      email: data.email,
      tel: data.tel,
      role: data.role,
      password_hash: passwordHash,
    },
  });
}

async function upsertAuthor(name) {
  const existing = await prisma.author.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.author.create({ data: { name } });
}

async function upsertCategory(name) {
  const existing = await prisma.category.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.category.create({ data: { name } });
}

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Users
  const admin = await upsertUser(ADMIN_USER);
  console.log(`  ✅ Admin user: ${admin.email} (${admin.role})`);

  const client = await upsertUser(CLIENT_USER);
  console.log(`  ✅ Client user: ${client.email} (${client.role})`);

  // 2. Authors
  const authorMap = {};
  for (const a of AUTHORS) {
    const created = await upsertAuthor(a.name);
    authorMap[a.name] = created.id;
    console.log(`  ✅ Author: ${a.name}`);
  }

  // 3. Categories
  const categoryMap = {};
  for (const c of CATEGORIES) {
    const created = await upsertCategory(c.name);
    categoryMap[c.name] = created.id;
    console.log(`  ✅ Category: ${c.name}`);
  }

  // 4. Books
  let bookCount = 0;
  for (const b of BOOKS) {
    const authorId = authorMap[b.authorName];
    const categoryId = categoryMap[b.categoryName];

    if (!authorId || !categoryId) {
      console.log(`  ⚠️  Skipping "${b.name}" — author or category not found`);
      continue;
    }

    const existingBook = await prisma.book.findFirst({ where: { name: b.name } });
    if (existingBook) {
      console.log(`  ⚠️  Book "${b.name}" already exists, skipping`);
      continue;
    }

    await prisma.book.create({
      data: {
        name: b.name,
        price: b.price,
        stock: b.stock,
        language: b.language,
        publication_date: new Date(b.publicationDate),
        description: b.description,
        image_url: `https://picsum.photos/seed/${encodeURIComponent(b.name)}/400/600`,
        author_id: authorId,
        category_id: categoryId,
      },
    });
    bookCount++;
  }
  console.log(`  ✅ Books: ${bookCount} seeded`);

  console.log("\n🎉 Seed completed successfully!");
  console.log(`\n  Admin login:  ${ADMIN_USER.email} / ${ADMIN_USER.password}`);
  console.log(`  Client login: ${CLIENT_USER.email} / ${CLIENT_USER.password}\n`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
