const pool = require('../../middleware/db');

exports.indexPage = async (req, res) => {
    try {
        if (req.session.uid){
            // const order_info = await pool.query(
            //     'select * from `order` where user_uid = ?',
            //     [req.session.uid]
            // );
            // console.log(order_info[0][0].orderDate);
            // const point_info = await pool.query(
            //     'select point from user where uid = ?',
            //     [req.session.uid]
            // );

            const count_list = await pool.query(
                'SELECT menu_menuID, SUM(orderQuantity) AS TotalOrderQuantity FROM `detail` GROUP BY menu_menuID ORDER BY TotalOrderQuantity DESC;'
            );
    
            const menu_info = await pool.query(
                'select * from `menu`'
            );

            return res.render("index", {
                signinStatus: req.session.uid,
                // order_infos : order_info[0],
                // points : point_info[0],
                count_lists : count_list[0],
                menu_infos : menu_info[0],
            })
        } else {
            const count_list = await pool.query(
                'SELECT menu_menuID, SUM(orderQuantity) AS TotalOrderQuantity FROM `detail` GROUP BY menu_menuID ORDER BY TotalOrderQuantity DESC;'
            );
    
            const menu_info = await pool.query(
                'select * from `menu`'
            );
            return res.render("index", {
                signinStatus: false,
                count_lists : count_list[0],
                menu_infos : menu_info[0],
            });
        }
    } catch (error) {
        console.log(error);
    }
}