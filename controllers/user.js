const User = require("../models/user.js");

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const NewUser = new User({ email, username });
        const registeredUser = await User.register(NewUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to BookMyShow!");
            res.redirect("/listings");
    });
 } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome Back!");
    res.redirect(res.locals.redirectUrl || "/listings");
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
          return next(err);
        }
        req.flash("success", "Logged Out Successfull!");
        res.redirect("/listings");
    });
}