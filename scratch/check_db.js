const sequelize = require('../server/src/config/database');
const { User, Like, Collect, CircleMoment } = require('../server/src/models');

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    const queryInterface = sequelize.getQueryInterface();
    const likeTable = await queryInterface.describeTable('likes');
    const collectTable = await queryInterface.describeTable('collects');
    
    console.log('Likes table userId type:', likeTable.userId.type);
    console.log('Collects table userId type:', collectTable.userId.type);
    
    const count = await CircleMoment.count();
    console.log('Total moments:', count);
    
    const demoUser = await User.findOne({ where: { phone: '13800138000' } });
    if (demoUser) {
      console.log('Demo user ID (Int):', demoUser.id);
      console.log('Demo user UUID:', demoUser.userId);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
