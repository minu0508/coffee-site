const pool = require('../../middleware/db');

exports.bestPage = async (req, res) => {
    try {
        const count_list = await pool.query(
            'SELECT menu_menuID, SUM(orderQuantity) AS TotalOrderQuantity FROM `detail` GROUP BY menu_menuID ORDER BY TotalOrderQuantity DESC;'
        );

        const menu_info = await pool.query(
            'select * from `menu`'
        );

        return res.render("bestmenu", {
            count_lists : count_list[0],
            menu_infos : menu_info[0],
            max_infos : false,
        });
    } catch (error) {
        console.log(error);
    }
}

exports.print = async (req, res) => {
    try {
        console.log("성공");
        const count_list = await pool.query(
            'SELECT menu_menuID, SUM(orderQuantity) AS TotalOrderQuantity FROM `detail` GROUP BY menu_menuID ORDER BY TotalOrderQuantity DESC;'
        );

        const menu_info = await pool.query(
            'select * from `menu`'
        );

        const tenM_info = await pool.query(
            'SELECT menu_menuID, SUM(orderQuantity) AS TotalOrderQuantity FROM `detail` where order_orderID in (SELECT orderID FROM `order` where orderDate like "%2023-10%")GROUP BY menu_menuID ORDER BY TotalOrderQuantity DESC;'
        );
        const eleM_info = await pool.query(
            'SELECT menu_menuID, SUM(orderQuantity) AS TotalOrderQuantity FROM `detail` where order_orderID in (SELECT orderID FROM `order` where orderDate like "%2023-11%")GROUP BY menu_menuID ORDER BY TotalOrderQuantity DESC;'
        );

        const max_info = await pool.query(
            'select * from `maxmenu`'
        );

        if (max_info[0].length == 0){
            for (var i = 0; i < 2; i++) {
                await pool.query (
                    'insert into `maxmenu` (date, grade, menu_menuID, quantity) values (?, ?, ?, ?)',
                    [202310, i + 1, menu_info[0][tenM_info[0][i].menu_menuID - 1].menuID, tenM_info[0][i].TotalOrderQuantity]
                );
            };

            for (var i = 0; i < 2; i++) {
                await pool.query (
                    'insert into `maxmenu` (date, grade, menu_menuID, quantity) values (?, ?, ?, ?)',
                    [202311, i + 1, menu_info[0][eleM_info[0][i].menu_menuID - 1].menuID, eleM_info[0][i].TotalOrderQuantity]
                );
            };
        } else {
            // console.log(tenM_info[0][0].menu_menuID, eleM_info[0][0].menu_menuID);
            // console.log(tenM_info[0][1].menu_menuID, eleM_info[0][1].menu_menuID);
            // console.log(menu_info[0][tenM_info[0][0].menu_menuID - 1].menuID, menu_info[0][tenM_info[0][1].menu_menuID - 1].menuID);
            // console.log(menu_info[0][eleM_info[0][0].menu_menuID - 1].menuID, menu_info[0][eleM_info[0][1].menu_menuID - 1].menuID);
            for (var i = 0; i < 2; i++) {
                await pool.query(
                    'update `maxmenu` set quantity = ?, menu_menuID = ? where date = ? and grade = ?',
                    [tenM_info[0][i].TotalOrderQuantity, menu_info[0][tenM_info[0][i].menu_menuID - 1].menuID, 202310, i + 1]
                    );
                console.log(menu_info[0][tenM_info[0][i].menu_menuID - 1].menuID, tenM_info[0][i].TotalOrderQuantity);
            };
    
            for (var i = 0; i < 2; i++) {
                await pool.query(
                    'update `maxmenu` set quantity = ?, menu_menuID = ? where date = ? and grade = ?',
                    [eleM_info[0][i].TotalOrderQuantity, menu_info[0][eleM_info[0][i].menu_menuID - 1].menuID, 202311, i + 1]
                    );
                console.log(menu_info[0][eleM_info[0][i].menu_menuID - 1].menuID, eleM_info[0][i].TotalOrderQuantity);
            };
        };

        const max_infos = await pool.query(
            'select * from `maxmenu`'
        )

        console.log(max_infos[0]);
        
        return res.render("bestmenu", {
            count_lists : count_list[0],
            menu_infos : menu_info[0],
            max_infos : max_info[0],
        });
    } catch (error) {
        console.log(error);
    }
}