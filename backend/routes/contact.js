// routes/contact.js
// API untuk form kontak + notifikasi email

const express  = require('express');
const router   = express.Router();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const db       = require('../config/database');
const auth     = require('../middleware/auth');

// ─── Nodemailer transporter ────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Gmail App Password
  },
});

// ─── Validasi input ────────────────────────────────────────
const contactValidation = [
  body('name')
    .trim().notEmpty().withMessage('Nama wajib diisi.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama 2–100 karakter.'),
  body('email')
    .trim().isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),
  body('subject')
    .trim().notEmpty().withMessage('Subjek wajib diisi.')
    .isLength({ min: 3, max: 200 }),
  body('message')
    .trim().notEmpty().withMessage('Pesan wajib diisi.')
    .isLength({ min: 10, max: 3000 }),
];

// ─── POST /api/contact  ────────────────────────────────────
// Terima pesan dari form & simpan ke DB
router.post('/', contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { name, email, subject, message } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    // Simpan ke database
    const [result] = await db.execute(
      `INSERT INTO contacts (name, email, subject, message, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, subject, message, ip]
    );

    // Kirim email notifikasi ke pemilik portfolio
    const mailOptions = {
      from:    `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_TO,
      subject: `[Portfolio] ${subject} — dari ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px;">
          <h2 style="color:#c8a97e;">📬 Pesan Baru dari Portfolio</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;color:#555;width:100px;"><b>Nama</b></td><td style="padding:8px;">${name}</td></tr>
            <tr style="background:#fff;"><td style="padding:8px;color:#555;"><b>Email</b></td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;color:#555;"><b>Subjek</b></td><td style="padding:8px;">${subject}</td></tr>
            <tr style="background:#fff;"><td style="padding:8px;color:#555;vertical-align:top;"><b>Pesan</b></td><td style="padding:8px;">${message.replace(/\n/g,'<br>')}</td></tr>
          </table>
          <p style="margin-top:16px;color:#aaa;font-size:12px;">ID Pesan: #${result.insertId} | Waktu: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      `,
    };

    // Kirim email — jika gagal, tetap return success (pesan sudah tersimpan di DB)
    transporter.sendMail(mailOptions).catch(err =>
      console.warn('⚠️  Email notifikasi gagal dikirim:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim! Terima kasih.',
      id: result.insertId,
    });

  } catch (err) {
    console.error('❌ Contact POST error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// ─── GET /api/contact  (admin only) ───────────────────────
router.get('/', auth, async (req, res) => {
  const page  = parseInt(req.query.page  || 1);
  const limit = parseInt(req.query.limit || 20);
  const offset = (page - 1) * limit;

  try {
    const [[{ total }]] = await db.execute('SELECT COUNT(*) AS total FROM contacts');
    const [rows] = await db.execute(
      'SELECT * FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json({ success: true, total, page, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PATCH /api/contact/:id/read  (admin only) ────────────
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await db.execute('UPDATE contacts SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Ditandai sebagai sudah dibaca.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/contact/:id  (admin only) ────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pesan dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
