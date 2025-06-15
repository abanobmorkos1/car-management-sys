const LeaseReturn = require('../Schema/lease');
const main = async () => {
  const leases = await LeaseReturn.find({}).lean();
  let totalFake = 50;
  for (let i = 0; i < totalFake; i++) {
    let ramdomIndex = Math.floor(Math.random() * leases.length);
    let fakeLease = leases[ramdomIndex];
    fakeLease._id = undefined; // Reset _id for new document
    fakeLease.year = Math.floor(Math.random() * (2023 - 2000 + 1)) + 2000; // Random year between 2000 and 2023
    fakeLease.createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
    );
    fakeLease.updatedAt = new Date(
      Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
    );
    fakeLease.groundingStatus = '';
    await LeaseReturn.create(fakeLease);
  }
  console.log(`✅ Created ${totalFake} fake lease returns`);
};
// main();
