const bcrypt = require('bcryptjs');
const db = require('./config/db');

const users = [
  { name: 'Selvakarshan C K', email: 'selvakarshan.ck@innovatex.ac.in', password: '7397032409', role: 'captain' },
  { name: 'Santhosh S', email: 'santhosh.s@innovatex.ac.in', password: '9843650984', role: 'vice-captain' },
  { name: 'Yalini Sri T', email: 'yalinisri.t@innovatex.ac.in', password: '8072587938', role: 'manager' },
  { name: 'Tharun M', email: 'tharun.m@innovatex.ac.in', password: '8610000231', role: 'strategist' },
  { name: 'Sudhir S', email: 'sudhir.s@innovatex.ac.in', password: '7305080008', role: 'member' },
  { name: 'Naveen Karthi M', email: 'naveenkarthi.m@innovatex.ac.in', password: '6383499586', role: 'member' },
  { name: 'Nandhakishore L', email: 'nandhakishore.l@innovatex.ac.in', password: '9363731807', role: 'member' },
  { name: 'Nandhini K', email: 'nandhini.k@innovatex.ac.in', password: '6379109654', role: 'member' },
  { name: 'Akilesh G', email: 'akilesh.g@innovatex.ac.in', password: '7845566113', role: 'member' },
  { name: 'Dhiya K N', email: 'dhiya.kn@innovatex.ac.in', password: '8056333988', role: 'member' },
];

const seed = async () => {
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    db.query(
      'INSERT INTO users (name, email, password, role, ap_points, rp_points) VALUES (?, ?, ?, ?, 0, 0)',
      [user.name, user.email, hash, user.role],
      (err) => {
        if (err) console.log(`❌ Error inserting ${user.name}:`, err.message);
        else console.log(`✅ Inserted: ${user.name}`);
      }
    );
  }
};

seed();