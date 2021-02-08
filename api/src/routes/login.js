const server = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = server.Router();
const { User } = require("../db.js");
const nodemailer = require('nodemailer');

const { JWT_SECRET, JWT_EXPIRES } = process.env;

router.post("/", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ where: { email: email } }).then((userDB) => {
    if (!userDB) {
      return res.status(400).json({
        err: "Datos incorrectos",
      });
    }
    if (!bcrypt.compareSync(password, userDB.password)) {
      return res.status(400).json({
        err: "Datos incorrectos",
      });
    }

    //Generamos el JWT
    let token = jwt.sign(
      {
        user: userDB,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      user: userDB,
      loggedIn: true,
      token,
    });
  });
});


// ============ Forgot Password ============ //

const token = Math.floor((Math.random() * 1000000) + 1);

router.post('/forgot', (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then((user) => {
      if (!user){
        return res.status(400).json({
        err: "Invalid email",
      }).redirect('/forgot')
      }
      user.update({
        ...user,
        resetPassToken: token,
        resetPassExpires: Date.now() + 500000
      }).then(()=>{
        const transporter = nodemailer.createTransport({
          host: "c2110783.ferozo.com",
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
          user: 'shop@henryshop.ml', // generated ethereal user
          pass: 'RUq*bn/0fY', // generated ethereal password
          },
          
        })
        const resetLink = 'http://localhost:3001/login/reset'
        const mailOptions = {
          from: 'shop@henryshop.ml',
          to: req.body.email,
          subject: 'Password reset',
          html: `To reset your password click in the following link and then fill the token indicated below <a href=${resetLink}> Link </a><br>
          Your Token: ${token}`
        }

        transporter.sendMail(mailOptions, (err, success) => {
            if (err) {
                res.status(400).json({
        err: "ERROR SENDING EMAIL",
         })   } })
             })
  })
})

// ============ Reset Password ============ //

router.post('/reset', (req, res) => {
    User.findOne({
        where: {
            resetPassToken: req.query.token
        }
    }).then(async (user) => {
        if (!user) {
            res.redirect('/forgot');
        } else {
            const hasshed = await bcrypt.hash(req.body.password, 10)
            if (user.resetPassExpires > Date.now()) {
                user.update({
                    ...user,
                    password: hasshed,
                    resetPassExpires: null,
                    resetPassToken: null,
                }).then(() => {
                    res.send({
                        result: 'Your password has been updated'
                    })
                })
            }
        }
    }).catch((err) => {
        req.flash('Your token password reset has been expired');
        res.status(404);
    })
})







module.exports = router;
