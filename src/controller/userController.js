const pool = require('../../middleware/db');


// ***** 로그인 Controller *****
// 로그인 페이지
exports.signinPage = async (req, res) => {
    try {
        console.log(req.session.uid);
        if (req.session.uid) {
            delete req.session.uid;
            return res.redirect("/");
        } else {           
            return res.render("signin");
        }
    } catch (error) {
        console.log(error);
    }
}

// 로그인 성공 및 실패
exports.signin = async (req, res) => {
    try {
        const { uid, upw } = req.body;
        const user = await pool.query(
            "select * from user where uid = ?",
            [ uid ]
        );
        if (user[0].length !== 0) {
            if (user[0][0].upw == upw) {
                req.session.uid = uid;
                req.session.save();
                return res.redirect("/");
            } else {
                return res.redirect("signin");
            }
        } else {
            return res.redirect("signin");
        }
    } catch (error) {
        console.log(error);
    }
}

// ***** 회원가입 Controller *****
// 회원가입 페이지
exports.signupPage = async (req, res) => {
    return res.render("signup")
}

// 회원가입 DB 저장
exports.signup = async (req, res) => {
    try {
        const { uid, upw, userName, userAddress, ph } = req.body;
        await pool.query(
            "insert into user (uid, upw, userName, userAddress, ph) value(?, ?, ?, ?, ?)",
            [ uid, upw, userName, userAddress, ph ]
        );
        return res.redirect("/");
    } catch (error) {
        console.log(error);
        return error;
    }
};


