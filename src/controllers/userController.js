const UserController = {
  async protectedRoute(req, res) {
    res.json({ message: 'You have access to this protected route' });
  },
};

module.exports = UserController;
