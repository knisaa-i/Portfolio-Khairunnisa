-- ============================================================
--  PORTFOLIO DATABASE SCHEMA — Khairunnisa
--  Jalankan file ini di MySQL Workbench atau terminal:
--    mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio_db;

-- ─── TABEL: admin ──────────────────────────────────────────
-- Menyimpan akun admin untuk dashboard
CREATE TABLE IF NOT EXISTS admin (
  id         INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)   NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,  -- bcrypt hash
  email      VARCHAR(100)  NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── TABEL: contacts ───────────────────────────────────────
-- Menyimpan pesan dari form kontak
CREATE TABLE IF NOT EXISTS contacts (
  id         INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL,
  subject    VARCHAR(200)  NOT NULL,
  message    TEXT          NOT NULL,
  is_read    TINYINT(1)    DEFAULT 0,
  ip_address VARCHAR(45),
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── TABEL: projects ───────────────────────────────────────
-- Menyimpan data proyek (bisa dikelola dari admin dashboard)
CREATE TABLE IF NOT EXISTS projects (
  id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150)  NOT NULL,
  description TEXT          NOT NULL,
  category    ENUM('web', 'mobile', 'data', 'other') DEFAULT 'web',
  tech_stack  JSON,                                -- e.g. ["React","Node.js","MySQL"]
  image_url   VARCHAR(300),
  demo_url    VARCHAR(300),
  github_url  VARCHAR(300),
  is_featured TINYINT(1)    DEFAULT 0,
  sort_order  INT           DEFAULT 0,
  year        YEAR,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── TABEL: skills ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id         INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(80)   NOT NULL,
  category   VARCHAR(60)   NOT NULL,  -- Frontend, Backend, Database, Tools, Data/AI, Soft Skills
  level      ENUM('beginner', 'intermediate', 'expert') DEFAULT 'intermediate',
  sort_order INT           DEFAULT 0,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── TABEL: experiences ────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiences (
  id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('work', 'education') NOT NULL,
  title       VARCHAR(150) NOT NULL,
  institution VARCHAR(150) NOT NULL,
  location    VARCHAR(100),
  start_date  DATE         NOT NULL,
  end_date    DATE,                    -- NULL berarti "sampai sekarang"
  is_current  TINYINT(1)   DEFAULT 0,
  description TEXT,
  tech_tags   JSON,
  sort_order  INT          DEFAULT 0,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── TABEL: certifications ─────────────────────────────────
CREATE TABLE IF NOT EXISTS certifications (
  id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(150) NOT NULL,
  issuer       VARCHAR(150) NOT NULL,
  issue_date   DATE,
  expiry_date  DATE,
  credential_url VARCHAR(300),
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── TABEL: visitor_logs ───────────────────────────────────
-- Statistik pengunjung sederhana
CREATE TABLE IF NOT EXISTS visitor_logs (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  page       VARCHAR(100) DEFAULT '/',
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer   VARCHAR(300),
  visited_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_visited (visited_at),
  INDEX idx_ip (ip_address)
) ENGINE=InnoDB;

-- ─── TABEL: settings ───────────────────────────────────────
-- Key-value store untuk konfigurasi site
CREATE TABLE IF NOT EXISTS settings (
  `key`       VARCHAR(80)  NOT NULL PRIMARY KEY,
  `value`     TEXT,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  DATA AWAL (SEED)
-- ============================================================

-- Admin default (password: admin123 — GANTI setelah pertama login!)
INSERT IGNORE INTO admin (username, password, email) VALUES
('admin',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLXCJAVrmwa',
 'khairunnisa@email.com');

-- Settings
INSERT IGNORE INTO settings (`key`, `value`) VALUES
('site_title',       'Khairunnisa — Portfolio'),
('site_description', 'Fresh Graduate S1 Teknik Informatika | Web Developer | ML Enthusiast'),
('cv_url',           'assets/CV_Khairunnisa.pdf'),
('is_open_to_work',  '1');

-- Proyek
INSERT IGNORE INTO projects (title, description, category, tech_stack, demo_url, github_url, is_featured, year) VALUES
('E-Commerce Platform',
 'Aplikasi e-commerce full-stack dengan fitur autentikasi, keranjang belanja, dan dashboard admin.',
 'web',
 '["React.js","Node.js","MySQL","Express"]',
 '#', 'https://github.com/khairunnisa', 1, 2024),

('Sistem Informasi Perpustakaan',
 'Aplikasi manajemen perpustakaan digital dengan fitur peminjaman dan laporan statistik.',
 'web',
 '["Laravel","MySQL","Bootstrap"]',
 '#', 'https://github.com/khairunnisa', 1, 2023),

('Prediksi Penyakit Diabetes',
 'Model machine learning prediksi risiko diabetes menggunakan Random Forest — akurasi 89%.',
 'data',
 '["Python","Scikit-learn","Pandas","Matplotlib"]',
 '#', 'https://github.com/khairunnisa', 1, 2023),

('Aplikasi To-Do List Mobile',
 'Aplikasi manajemen tugas mobile dengan sinkronisasi real-time dan reminder.',
 'mobile',
 '["React Native","Firebase"]',
 '#', 'https://github.com/khairunnisa', 0, 2023),

('Sistem Antrian Puskesmas',
 'Manajemen antrian pasien dengan notifikasi SMS dan tampilan antrian digital.',
 'web',
 '["PHP","MySQL","Bootstrap"]',
 '#', 'https://github.com/khairunnisa', 0, 2022),

('Analisis Sentimen Media Sosial',
 'Analisis sentimen tweet menggunakan NLP untuk isu lingkungan hidup.',
 'data',
 '["Python","NLTK","Tableau","Pandas"]',
 '#', 'https://github.com/khairunnisa', 0, 2023);

-- Skills
INSERT IGNORE INTO skills (name, category, level, sort_order) VALUES
('HTML5',        'Frontend', 'expert',       1),
('CSS3',         'Frontend', 'expert',       2),
('JavaScript',   'Frontend', 'expert',       3),
('React.js',     'Frontend', 'intermediate', 4),
('Bootstrap',    'Frontend', 'intermediate', 5),
('Tailwind CSS', 'Frontend', 'intermediate', 6),
('PHP',          'Backend',  'expert',       1),
('Node.js',      'Backend',  'intermediate', 2),
('Express.js',   'Backend',  'intermediate', 3),
('Laravel',      'Backend',  'intermediate', 4),
('Python',       'Backend',  'beginner',     5),
('MySQL',        'Database', 'expert',       1),
('PostgreSQL',   'Database', 'intermediate', 2),
('MongoDB',      'Database', 'intermediate', 3),
('Firebase',     'Database', 'beginner',     4),
('Git & GitHub', 'Tools',    'expert',       1),
('VS Code',      'Tools',    'intermediate', 2),
('Figma',        'Tools',    'intermediate', 3),
('Postman',      'Tools',    'intermediate', 4),
('Docker',       'Tools',    'beginner',     5),
('Linux',        'Tools',    'beginner',     6),
('Python (Pandas)',    'Data/AI', 'intermediate', 1),
('Machine Learning',  'Data/AI', 'intermediate', 2),
('TensorFlow',        'Data/AI', 'beginner',     3),
('Tableau',           'Data/AI', 'beginner',     4);

-- Certifications
INSERT IGNORE INTO certifications (title, issuer, issue_date) VALUES
('Bangkit Academy ML Path',      'Google, GoTo, Traveloka',  '2023-12-01'),
('Web Development',              'Dicoding Indonesia',        '2023-06-01'),
('SQL for Data Science',         'Coursera / UC Davis',       '2022-09-01'),
('React – The Complete Guide',   'Udemy',                    '2023-03-01'),
('Google IT Support',            'Coursera / Google',         '2022-05-01');

-- ============================================================
--  INDEXES TAMBAHAN
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contacts_read    ON contacts (is_read);
CREATE INDEX IF NOT EXISTS idx_contacts_email   ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_projects_cat     ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_feature ON projects (is_featured);
CREATE INDEX IF NOT EXISTS idx_skills_cat       ON skills (category);

-- Done ✅
SELECT 'Database portfolio_db berhasil dibuat dan data awal dimasukkan!' AS status;
