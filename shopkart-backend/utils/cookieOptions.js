const authCookieOptions = () => {
  const production = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'strict',
  };
};

module.exports = authCookieOptions;
