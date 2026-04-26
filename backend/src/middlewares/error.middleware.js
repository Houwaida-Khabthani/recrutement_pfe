module.exports = (err, req, res, next) => {
  // Don't try to send response if headers already sent
  if (res.headersSent) {
    console.error('[ERROR MIDDLEWARE] Headers already sent, cannot send error response');
    return;
  }

  const status = err.status || err.statusCode || 500;
  
  console.error('[ERROR MIDDLEWARE]', {
    message: err.message,
    status: status,
    path: req.path,
    method: req.method,
    stack: err.stack?.split('\n').slice(0, 3).join('\n')
  });

  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json({ 
    error: err.message,
    message: err.message,
    status: status,
    path: req.path
  });
};