// Usage: node --env-file=.env.local scripts/seed-demo.mjs
import { seedDemo } from "../lib/demo.js";

try {
  console.log("Demo data ready:", await seedDemo());
} catch (error) {
  console.error("Seeding failed:", error.message ?? error);
  process.exit(1);
}
