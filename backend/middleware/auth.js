const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX: always normalize user
    req.user = decoded.user || decoded;

    next();

  } catch (err) {
    console.error('🔥 AUTH ERROR:', err);
    return res.status(401).json({ msg: 'Invalid token' });
  }
};