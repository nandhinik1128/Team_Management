const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../config/db');

const predefinedSkillsSeed = [
  { id: 11, skill_name: 'C Programming', category: 'Software', course_for: 'ps', total_levels: 7, img: '5.png' },
  { id: 26, skill_name: 'Aptitude', category: 'GENERAL Skill', course_for: 'ps', total_levels: 14, img: '20.png' },
  { id: 52, skill_name: 'Problem Solving Skills - Daily Challenge', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: '2.png' },
  { id: 71, skill_name: 'Communication', category: 'GENERAL Skill', course_for: 'ps', total_levels: 3, img: '71.png' },
  { id: 77, skill_name: 'Computer Networking', category: 'Software', course_for: 'ps', total_levels: 5, img: '77.png' },
  { id: 78, skill_name: 'Physical Fitness', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: '78.png' },
  { id: 84, skill_name: 'Leadership', category: 'GENERAL Skill', course_for: 'ps', total_levels: 4, img: '56.png' },
  { id: 86, skill_name: 'Linux', category: 'Software', course_for: 'ps', total_levels: 4, img: 'devops_loop.jpeg' },
  { id: 124, skill_name: 'IPR - Patent Search', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'patent-translation.jpg' },
  { id: 150, skill_name: 'Creative Media', category: 'Software', course_for: 'ps', total_levels: 1, img: 'images.jpg' },
  { id: 156, skill_name: 'System Administration', category: 'Hardware', course_for: 'ps', total_levels: 1, img: 'system admin.jpg' },
  { id: 179, skill_name: 'PLC - Gurugulam Assessment', category: 'Hardware', course_for: 'ps', total_levels: 1, img: 'PLC.jpg' },
  { id: 180, skill_name: 'Electronics - Gurugulam Assessment', category: 'Hardware', course_for: 'ps', total_levels: 1, img: 'Electronics.jpg' },
  { id: 181, skill_name: 'Electrical Wiring - Gurugulam Assessment', category: 'Hardware', course_for: 'ps', total_levels: 1, img: 'Electrical-Installation.webp' },
  { id: 182, skill_name: 'Welding - Gurugulam Assessment', category: 'Hardware', course_for: 'ps', total_levels: 1, img: 'welding.jpg' },
  { id: 185, skill_name: 'Assembly and Dismantling - Gurugulam Assessment', category: 'Hardware', course_for: 'ps', total_levels: 1, img: 'assemble.jpg' },
  { id: 186, skill_name: 'Prototype - Gurugulam Assessment', category: 'Hardware', course_for: 'ps', total_levels: 1, img: 'prototyping.jpg' },
  { id: 201, skill_name: 'Algebra', category: 'GENERAL Skill', course_for: 'ps', total_levels: 3, img: 'algebra.webp' },
  { id: 202, skill_name: 'GP Challenge', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'GP Challenge.png' },
  { id: 206, skill_name: 'HTML / CSS', category: 'Software', course_for: 'ps', total_levels: 1, img: '5380132_3dad.webp' },
  { id: 207, skill_name: 'PS Assessment - Brainstorming (2025-2029)', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'images.png' },
  { id: 211, skill_name: 'Physical Fitness - Yoga', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'images (3).jpg' },
  { id: 212, skill_name: 'Autonomy Affairs - Regulations', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'images (4).jpg' },
  { id: 217, skill_name: 'Problem Solving Skills - First Year', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'ss.jpg' },
  { id: 222, skill_name: 'React', category: 'Advanced', course_for: 'ps', total_levels: 1, img: 'OIP.webp' },
  { id: 223, skill_name: 'Project Based Learning - Night Slots', category: 'Beginner', course_for: 'ps', total_levels: 1, img: 'PBL-Header.png' },
  { id: 224, skill_name: 'Leetcode', category: 'Beginner', course_for: 'ps', total_levels: 1, img: 'leetcode-ps.png' },
  { id: 226, skill_name: 'Logical Reasoning', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: '3660ea9805d0.png' },
  { id: 231, skill_name: 'Data Structure - Core Conepts (PS-CSE)', category: 'Software', course_for: 'ps', total_levels: 1, img: 'Data-Structure-Algorithms.png' },
  { id: 232, skill_name: 'DBMS - Core Concept (PS-CSE)', category: 'Beginner', course_for: 'ps', total_levels: 1, img: 'DB.png' },
  { id: 240, skill_name: 'Java Script ', category: 'Beginner', course_for: 'ps', total_levels: 1, img: 'R.jpeg' },
  { id: 241, skill_name: 'Version control - Git, Github', category: 'Advanced', course_for: 'ps', total_levels: 1, img: 'images.png' },
  { id: 507, skill_name: 'Calculus', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'understanding-basic-calculus-a-beginners-guide.jpg' },
  { id: 508, skill_name: 'Differential Equations', category: 'GENERAL Skill', course_for: 'ps', total_levels: 1, img: 'istockphoto-1321253926-612x612.jpg' },
  { id: 520, skill_name: 'NodeJS', category: 'Advanced', course_for: 'ps', total_levels: 1, img: 'images (2).png' },
  { id: 533, skill_name: 'GP Challenge 2026', category: 'Beginner', course_for: 'ps', total_levels: 1, img: 'GP Challenge.png' },
];

const ensureSkillsTables = (callback) => {
  db.query(
    `CREATE TABLE IF NOT EXISTS predefined_skills (
      id INT PRIMARY KEY,
      skill_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      course_for VARCHAR(50) NOT NULL DEFAULT 'ps',
      total_levels INT NOT NULL DEFAULT 1,
      img VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (tableErr) => {
      if (tableErr) return callback(tableErr);
      db.query(
        `CREATE TABLE IF NOT EXISTS user_skill_progress (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          skill_id INT NOT NULL,
          completed_levels INT NOT NULL DEFAULT 0,
          status ENUM('not-started', 'in-progress', 'completed') NOT NULL DEFAULT 'not-started',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_skill (user_id, skill_id)
        )`,
        (progressErr) => {
          if (progressErr) return callback(progressErr);
          const values = predefinedSkillsSeed.map(skill => [skill.id, skill.skill_name, skill.category, skill.course_for, skill.total_levels, skill.img]);
          db.query(
            'INSERT IGNORE INTO predefined_skills (id, skill_name, category, course_for, total_levels, img) VALUES ?',
            [values],
            callback
          );
        }
      );
    }
  );
};

router.get('/predefined', verifyToken, (req, res) => {
  ensureSkillsTables((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare skills table!', error: tableErr.message });
    db.query(
      `SELECT ps.*, 
       COALESCE(usp.completed_levels, 0) as completed_levels,
       COALESCE(usp.status, 'not-started') as user_status,
       usp.id as progress_id
       FROM predefined_skills ps
       LEFT JOIN user_skill_progress usp ON ps.id = usp.skill_id AND usp.user_id = ?
       ORDER BY ps.category, ps.skill_name`,
      [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        res.json(results);
      }
    );
    });
});

router.get('/all-progress', verifyToken, (req, res) => {
  ensureSkillsTables((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare skills table!', error: tableErr.message });
    db.query(
      `SELECT usp.*, ps.skill_name, ps.category, ps.total_levels, u.name as user_name
       FROM user_skill_progress usp
       JOIN predefined_skills ps ON usp.skill_id = ps.id
       JOIN users u ON usp.user_id = u.id
       ORDER BY u.name, ps.skill_name`,
      (err, results) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        res.json(results);
      }
    );
    });
});

router.post('/progress', verifyToken, (req, res) => {
  const { skill_id, completed_levels, status } = req.body;
  ensureSkillsTables((tableErr) => {
    if (tableErr) return res.status(500).json({ message: 'Failed to prepare skills table!', error: tableErr.message });
    db.query(
      `INSERT INTO user_skill_progress (user_id, skill_id, completed_levels, status)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE completed_levels=?, status=?, updated_at=NOW()`,
      [req.user.id, skill_id, completed_levels, status, completed_levels, status],
      (err) => {
        if (err) return res.status(500).json({ message: 'Failed!', error: err.message });
        res.json({ message: 'Progress updated!' });
      }
    );
    });
});

module.exports = router;