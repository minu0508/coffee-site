const pool = require('../../middleware/db');

exports.resultPage = async (req, res) => {
    try {
        if (req.session.uid) {
            return res.render("result", {
                signinStatus : req.session.uid,
            });
        } else {
            return res.render('result');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.resultEnd = async (req, res) => {
    try {
        return res.redirect("/");
    } catch (error) {
        console.log(error);
    }
}