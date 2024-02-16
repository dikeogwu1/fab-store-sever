const tokenUser = ({ user }) => {
  return { name: user.firstName, userId: user._id, role: user.role };
};
module.exports = tokenUser;
