const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./schema/api/users');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email', passwordField: 'password', passReqToCallback: true }, (req, email, password, done) => {
      // Check if user exists with email and user_type
      User.findOne({ email: email, user_type: req.body.user_type })
        .then(user => {
          if (!user) {
            return done(null, false, { message: 'User not registered' });
          }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        })
        .catch(err => console.log(err));
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
