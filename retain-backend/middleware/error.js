export const notFound = (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
  };
  
  export const errorHandler = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate value: that record already exists' });
    }
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid id format' });
    }
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  };