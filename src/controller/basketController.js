const pool = require('../../middleware/db');


// ***** 장바구니 Controller *****
// -- 장바구니 페이지 --

exports.basketPage = async (req, res) => {
    try {
        if (req.session.uid){
            const basket_info = await pool.query(
                'select * from basketdetail where user_uid = ?',
                [req.session.uid]
            );
            const menu_info = await pool.query (
                'select menuName, menuPrice from menu'
            )
            return res.render("basket", {
                basket_infos : basket_info[0],
                menu_infos : menu_info[0],
                signinStatus: req.session.uid,
            });
        } else {
            return res.redirect("/signin");
        }
    } catch (error) {
        console.log(error);
    }
}

exports.basketOrder = async (req, res) => {
    try {
        const basket_info = await pool.query(
            'select user_uid from `basketdetail` where user_uid = ?',
            [req.session.uid]
        );

        console.log(basket_info[0]);
        if (basket_info[0].length !== 0) {

            const basket_info = await pool.query(
                'select * from basketdetail where user_uid = ?',
                [req.session.uid]
            );
            
            const menu_info = await pool.query(
                'select * from menu'
            );
            
            var totalMoney =  0;
            for (var i=0; i < basket_info[0].length; i++) {
                // console.log(menu_info[0][basket_info[0][i].menu_menuID - 1].menuPrice * basket_info[0][i].basketQuantity);
                totalMoney += menu_info[0][basket_info[0][i].menu_menuID - 1].menuPrice * basket_info[0][i].basketQuantity;
            };
    
            return res.render("order", {
                basket_infos : basket_info[0],
                menu_infos : menu_info[0],
                totalMoney : totalMoney,
                basketStatus : true,
                signinStatus : req.session.uid,
            });
        } else {
            return res.redirect("/basket")
        }
    } catch (error) {
        console.log(error);
    }
}

exports.deleteBasket = async(req, res) => {
    try {
        const menu_id = req.params;
        console.log("장바구니에서 삭제");
        console.log(parseInt(menu_id.menuID) + 1);
        

        await pool.query(
            'delete from basketdetail where user_uid = ? and menu_menuID = ?',
            [req.session.uid, parseInt(menu_id.menuID) + 1]
        );

        return res.redirect('/basket')
    } catch (error) {
        console.log(error)
    }
}