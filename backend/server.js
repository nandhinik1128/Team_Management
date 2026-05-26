const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./config/db');

// Ensure project_members table and member_status column exist on startup
const ensureProjectMembersTable = `CREATE TABLE IF NOT EXISTS project_members (
	id INT PRIMARY KEY AUTO_INCREMENT,
	project_id INT NOT NULL,
	user_id INT NOT NULL,
	member_status ENUM('in-progress','completed') NOT NULL DEFAULT 'in-progress',
	UNIQUE KEY unique_project_member (project_id, user_id)
);`;

db.query(ensureProjectMembersTable, (err) => {
	if (err) {
		console.error('Error ensuring project_members table:', err.message || err);
	} else {
		console.log('Ensured project_members table exists');
	}
});

// Some MySQL versions don't support ADD COLUMN IF NOT EXISTS. Check information_schema first.
const checkMemberStatusColumn = `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'project_members' AND COLUMN_NAME = 'member_status'`;
db.query(checkMemberStatusColumn, [process.env.DB_NAME], (err, results) => {
	if (err) {
		console.error('Error checking project_members columns:', err.message || err);
		return;
	}
	const count = results && results[0] && (results[0].cnt || results[0].COUNT || Object.values(results[0])[0]);
	if (Number(count) === 0) {
		const alterSql = `ALTER TABLE project_members ADD COLUMN member_status ENUM('in-progress','completed') NOT NULL DEFAULT 'in-progress'`;
		db.query(alterSql, (alterErr) => {
			if (alterErr) {
				if (alterErr.code === 'ER_DUP_FIELDNAME' || /Duplicate column/i.test(alterErr.message)) {
					return;
				}
				console.error('Error adding member_status column:', alterErr.message || alterErr);
			} else {
				console.log('Added member_status column to project_members');
			}
		});
	} else {
		console.log('member_status column already exists');
	}
});

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/ap-requests', require('./routes/apRequests'));
app.use('/api/attendance', require('./routes/attendance'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require('./config/db');