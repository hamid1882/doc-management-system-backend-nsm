// API key authorization middleware
const apiKeyAuth = (req, res, next) => {
  // Get API key from request headers
  const apiKey = req.headers['x-api-key'];

  // Check if API key exists and matches the expected value
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid API key'
    });
  }

  // If API key is valid, proceed to the next middleware or route handler
  next();
};

module.exports = { apiKeyAuth };