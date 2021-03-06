const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const cryptoJS = require('crypto-js');
const User = require('../models/User');
//const encryptor = require('simple-encryptor')(process.env.MY_SECRET_KEY);

exports.signup = (req, res, next) => {
  const regex =/^[a-z0-9_-]{1,10}$/ //regexp pour prod /^(?=.[a-z])(?=.[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/ Min 8 characters 1 Uppercase Alphabet, 1 Lowercase Alphabet and 1 Number
  //const encryptedEmail = encryptor.encrypt(req.body.email);

  if (req.body.password.match(regex)) {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      let buff = new Buffer(req.body.email);
      let emailInbase64 = buff.toString('base64');

      const user = new User({
        email: emailInbase64,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  } else {
  throw  Error("Le mot de passe n'est pas assez sécurisé");
  }
};

exports.login = (req, res, next) => {
  //const encryptedEmail = encryptor.encrypt(req.body.email);
  let buff = new Buffer(req.body.email);
  let emailInbase64 = buff.toString('base64');
  console.log(emailInbase64);
  User.findOne({ email: emailInbase64 })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};