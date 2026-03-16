const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3001;
const APP_PASSWORD = process.env.APP_PASSWORD || 'golf2024';
const SESSION_SECRET = process.env.SESSION_SECRET || 'golf-tracker-secret-key-change-in-production';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../client/dist')));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/scorecards')) {
  fs.mkdirSync('uploads/scorecards');
}
if (!fs.existsSync('uploads/photos')) {
  fs.mkdirSync('uploads/photos');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.path.includes('scorecard') ? 'uploads/scorecards' : 'uploads/photos';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const db = new sqlite3.Database('./golf-tracker.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      course_name TEXT,
      dad_score INTEGER NOT NULL,
      ethan_score INTEGER NOT NULL,
      dad_front_nine INTEGER,
      ethan_front_nine INTEGER,
      dad_back_nine INTEGER,
      ethan_back_nine INTEGER,
      scorecard_image TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
    )
  `);
}

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Auth endpoints
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === APP_PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true, message: 'Logged in successfully' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ success: true, message: 'Logged out successfully' });
    }
  });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: req.session && req.session.authenticated === true });
});

app.get('/api/rounds', (req, res) => {
  db.all('SELECT * FROM rounds ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/rounds/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM rounds WHERE id = ?', [id], (err, round) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!round) {
      res.status(404).json({ error: 'Round not found' });
      return;
    }

    db.all('SELECT * FROM photos WHERE round_id = ?', [id], (err, photos) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ ...round, photos });
    });
  });
});

app.post('/api/rounds', requireAuth, (req, res) => {
  const {
    date,
    course_name,
    dad_score,
    ethan_score,
    dad_front_nine,
    ethan_front_nine,
    dad_back_nine,
    ethan_back_nine,
    notes
  } = req.body;

  db.run(
    `INSERT INTO rounds (date, course_name, dad_score, ethan_score, dad_front_nine, 
     ethan_front_nine, dad_back_nine, ethan_back_nine, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [date, course_name, dad_score, ethan_score, dad_front_nine, ethan_front_nine, 
     dad_back_nine, ethan_back_nine, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/rounds/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const {
    date,
    course_name,
    dad_score,
    ethan_score,
    dad_front_nine,
    ethan_front_nine,
    dad_back_nine,
    ethan_back_nine,
    notes
  } = req.body;

  db.run(
    `UPDATE rounds SET date = ?, course_name = ?, dad_score = ?, ethan_score = ?, 
     dad_front_nine = ?, ethan_front_nine = ?, dad_back_nine = ?, ethan_back_nine = ?, 
     notes = ? WHERE id = ?`,
    [date, course_name, dad_score, ethan_score, dad_front_nine, ethan_front_nine, 
     dad_back_nine, ethan_back_nine, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    }
  );
});

app.delete('/api/rounds/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT scorecard_image FROM rounds WHERE id = ?', [id], (err, round) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (round && round.scorecard_image) {
      const filePath = path.join(__dirname, '..', round.scorecard_image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    db.all('SELECT filename FROM photos WHERE round_id = ?', [id], (err, photos) => {
      if (!err && photos) {
        photos.forEach(photo => {
          const filePath = path.join(__dirname, '..', photo.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      db.run('DELETE FROM rounds WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ changes: this.changes });
      });
    });
  });
});

app.post('/api/rounds/:id/scorecard', requireAuth, upload.single('scorecard'), (req, res) => {
  const { id } = req.params;
  const filename = 'uploads/scorecards/' + req.file.filename;

  db.get('SELECT scorecard_image FROM rounds WHERE id = ?', [id], (err, round) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (round && round.scorecard_image) {
      const oldPath = path.join(__dirname, '..', round.scorecard_image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    db.run('UPDATE rounds SET scorecard_image = ? WHERE id = ?', [filename, id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ filename });
    });
  });
});

app.post('/api/rounds/:id/photos', requireAuth, upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { caption } = req.body;
  const filename = 'uploads/photos/' + req.file.filename;

  db.run(
    'INSERT INTO photos (round_id, filename, caption) VALUES (?, ?, ?)',
    [id, filename, caption || ''],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, filename, caption });
    }
  );
});

app.delete('/api/photos/:id', requireAuth, (req, res) => {
  const { id } = req.params;

  db.get('SELECT filename FROM photos WHERE id = ?', [id], (err, photo) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (photo) {
      const filePath = path.join(__dirname, '..', photo.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    db.run('DELETE FROM photos WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ changes: this.changes });
    });
  });
});

app.get('/api/courses', (req, res) => {
  db.all(
    'SELECT DISTINCT course_name FROM rounds WHERE course_name IS NOT NULL AND course_name != "" ORDER BY course_name',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows.map(row => row.course_name));
    }
  );
});

app.get('/api/stats', (req, res) => {
  db.all('SELECT * FROM rounds ORDER BY date ASC', [], (err, rounds) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const stats = {
      totalRounds: rounds.length,
      totalHoles: 0,
      dadWins: 0,
      ethanWins: 0,
      ties: 0,
      dadTotalStrokes: 0,
      ethanTotalStrokes: 0,
      dadNormalizedStrokes: 0,
      ethanNormalizedStrokes: 0,
      dadAverage: 0,
      ethanAverage: 0,
      bestDadScore9: null,
      bestDadScore18: null,
      bestEthanScore9: null,
      bestEthanScore18: null,
      firstEthanWin: null,
      recentRounds: rounds.slice(-5).reverse(),
      highlights: {
        currentStreak: null,
        longestStreak: null,
        biggestWin: null,
        closestMatch: null,
        onThisDay: [],
        firstRound: rounds.length > 0 ? rounds[0] : null
      }
    };

    let currentStreakPlayer = null;
    let currentStreakCount = 0;
    let longestStreakPlayer = null;
    let longestStreakCount = 0;
    let biggestMargin = 0;

    rounds.forEach((round, index) => {
      stats.dadTotalStrokes += round.dad_score;
      stats.ethanTotalStrokes += round.ethan_score;

      // Calculate holes played (9 or 18)
      const hasNineHoleData = round.dad_front_nine || round.ethan_front_nine || 
                              round.dad_back_nine || round.ethan_back_nine;
      const hasBothNines = (round.dad_front_nine && round.dad_back_nine) || 
                           (round.ethan_front_nine && round.ethan_back_nine);
      
      let isNineHoleRound = false;
      if (hasBothNines) {
        stats.totalHoles += 18;
        isNineHoleRound = false;
      } else if (hasNineHoleData) {
        stats.totalHoles += 9;
        isNineHoleRound = true;
      } else {
        stats.totalHoles += 18;
        isNineHoleRound = false;
      }

      // For averages, normalize 9-hole rounds to 18-hole equivalents
      if (isNineHoleRound) {
        stats.dadNormalizedStrokes += round.dad_score * 2;
        stats.ethanNormalizedStrokes += round.ethan_score * 2;
      } else {
        stats.dadNormalizedStrokes += round.dad_score;
        stats.ethanNormalizedStrokes += round.ethan_score;
      }

      const margin = Math.abs(round.dad_score - round.ethan_score);
      let winner = null;

      if (round.dad_score < round.ethan_score) {
        stats.dadWins++;
        winner = 'dad';
      } else if (round.ethan_score < round.dad_score) {
        stats.ethanWins++;
        winner = 'ethan';
        if (!stats.firstEthanWin) {
          stats.firstEthanWin = round;
        }
      } else {
        stats.ties++;
        winner = 'tie';
      }

      // Track streaks
      if (winner !== 'tie') {
        if (winner === currentStreakPlayer) {
          currentStreakCount++;
        } else {
          currentStreakPlayer = winner;
          currentStreakCount = 1;
        }

        if (currentStreakCount > longestStreakCount) {
          longestStreakCount = currentStreakCount;
          longestStreakPlayer = currentStreakPlayer;
        }
      } else {
        currentStreakPlayer = null;
        currentStreakCount = 0;
      }

      // Track biggest win
      if (margin > biggestMargin && winner !== 'tie') {
        biggestMargin = margin;
        stats.highlights.biggestWin = { round, winner, margin };
      }

      // Track closest match
      if (!stats.highlights.closestMatch || margin < Math.abs(stats.highlights.closestMatch.round.dad_score - stats.highlights.closestMatch.round.ethan_score)) {
        if (winner !== 'tie') {
          stats.highlights.closestMatch = { round, margin };
        }
      }

      // Track best scores separately for 9-hole and 18-hole rounds
      if (isNineHoleRound) {
        if (!stats.bestDadScore9 || round.dad_score < stats.bestDadScore9.dad_score) {
          stats.bestDadScore9 = round;
        }
        if (!stats.bestEthanScore9 || round.ethan_score < stats.bestEthanScore9.ethan_score) {
          stats.bestEthanScore9 = round;
        }
      } else {
        if (!stats.bestDadScore18 || round.dad_score < stats.bestDadScore18.dad_score) {
          stats.bestDadScore18 = round;
        }
        if (!stats.bestEthanScore18 || round.ethan_score < stats.bestEthanScore18.ethan_score) {
          stats.bestEthanScore18 = round;
        }
      }

      // Check for "on this day" events (same month/day)
      const today = new Date();
      const roundDate = new Date(round.date);
      if (roundDate.getMonth() === today.getMonth() && roundDate.getDate() === today.getDate()) {
        stats.highlights.onThisDay.push(round);
      }
    });

    // Set current streak
    if (currentStreakCount > 0) {
      stats.highlights.currentStreak = {
        player: currentStreakPlayer,
        count: currentStreakCount
      };
    }

    // Set longest streak
    if (longestStreakCount > 1) {
      stats.highlights.longestStreak = {
        player: longestStreakPlayer,
        count: longestStreakCount
      };
    }

    if (rounds.length > 0) {
      stats.dadAverage = (stats.dadNormalizedStrokes / rounds.length).toFixed(1);
      stats.ethanAverage = (stats.ethanNormalizedStrokes / rounds.length).toFixed(1);
    }

    res.json(stats);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🏌️ Golf Tracker server running on port ${PORT}`);
});
