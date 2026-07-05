const User = require('../models/User');
const logger = require('./logger');

const DEFAULT_USERS = [
  {
    name: 'Employee Demo',
    email: 'employee@example.com',
    password: 'Password123!',
    role: 'employee',
  },
  {
    name: 'Manager Demo',
    email: 'manager@example.com',
    password: 'Password123!',
    role: 'manager',
  },
];

const seedDefaultUsers = async () => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    logger.info('✅ Existing users found; skipping development seed.');
    return;
  }

  logger.info('🔧 No users found; seeding development default accounts...');

  for (const user of DEFAULT_USERS) {
    await User.create({
      name: user.name,
      email: user.email,
      passwordHash: user.password,
      role: user.role,
    });
  }

  logger.info('✅ Default development users seeded:');
  logger.info('   - employee@example.com / Password123!');
  logger.info('   - manager@example.com  / Password123!');
};

module.exports = seedDefaultUsers;
