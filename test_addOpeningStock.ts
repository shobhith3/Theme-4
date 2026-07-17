import 'dotenv/config';
import { addOpeningStock } from './src/app/actions/stock-actions';
import { getPrisma } from './src/app/actions/engine-actions';

async function run() {
  const prisma = await getPrisma();
  const branch = await prisma.branch.findFirst();
  if (!branch) {
    console.error("No branch found to test with");
    return;
  }
  
  try {
    console.log(`Calling addOpeningStock with branch ${branch.id}...`);
    const result = await addOpeningStock({
      name: "Test Item",
      branchId: branch.id,
      qty: 10
    });
    console.log("Result:", result);
  } catch (err: any) {
    console.error("Error occurred:");
    console.error(err.message || err);
    console.error(err.stack);
  }
}

run().catch(console.error);
