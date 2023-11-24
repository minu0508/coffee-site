const pool = require('../../middleware/db');

exports.managementPage = async (req, res) => {
    try {
        const order_info = await pool.query(
            'select * from `order`'
        )

        return res.render("ordermanagement", {
            order_infos : order_info[0],
        });
    } catch (error) {
        console.log(error);
    }
}

exports.orderDetail = async (req, res) => {
    try {
        const order_id = req.params;
        console.log(order_id.order_id);
        
        const order_info = await pool.query(
            'select * from `detail` where order_orderID = ?',
            [order_id.orderID]
        );

        
        const menu_info = await pool.query(
            'select menuName, menuPrice from `menu`'
        )

        return res.render("orderDetail", {
            order_infos : order_info[0],
            menu_infos : menu_info[0],
            orderid : order_id.orderID,
        });
    } catch (error) {
        console.log(error);
    }
}

exports.orderCancel = async (req, res) => {
    try {
        const order_id = req.params.order_orderID;
        const menu_id = req.params.menu_menuID;
        const { Quantity } = req.body;
        
        const detail_info = await pool.query(
            'select orderQuantity, orderPrice from `detail` where menu_menuID = ? and order_orderID = ?',
            [menu_id, order_id]
        );

        const order_price_info = await pool.query(
            'select totalMoney from `order` where orderID = ?',
            [order_id]
        );
        console.log(order_price_info[0][0].totalMoney);
        const menu_info = await pool.query(
            'select menuPrice from `menu` where menuID = ?',
            [menu_id]
        )

        // 취소할 메뉴 가격 * 수량 값 출력
        if (Quantity == detail_info[0][0].orderQuantity){
            return res.redirect("/ordermanagement");
        } else if (Quantity == 0) {
            const modifyMoney = menu_info[0][0].menuPrice * detail_info[0][0].orderQuantity;
            await pool.query(
                'delete from `detail` where menu_menuID = ? and order_orderID = ?',
                [menu_id, order_id]
            );

            if (order_price_info[0][0].totalMoney - modifyMoney == 0) {
                await pool.query(
                    'delete from `order` where orderID = ?',
                    [order_id]
                );
            } else {
                await pool.query(
                    'update `order` set totalMoney = ? where orderID = ?',
                    [order_price_info[0][0].totalMoney - modifyMoney, order_id]
                );
            }
        } else {
            const modifyMoney = menu_info[0][0].menuPrice * Quantity;
            
            await pool.query(
                'update `detail` set orderQuantity = ?, orderPrice = ? where menu_menuID = ? and order_orderID = ?',
                [Quantity, modifyMoney, menu_id, order_id]  
                );

            await pool.query(
                'update `order` set totalMoney = ? where orderID = ?',
                [order_price_info[0][0].totalMoney - (detail_info[0][0].orderPrice - modifyMoney), order_id]
            );
        }
        return res.redirect("/ordermanagement");
    } catch (error) {
        console.log(error);
    }
}