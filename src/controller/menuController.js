const pool = require('../../middleware/db');

exports.menuPage = async (req, res) => {
    console.log(req.session.uid);
    try {
        if (req.session.uid){
            const menu_info = await pool.query(
                'select * from menu'
            );
            // console.log(menu_info[0]);
            return res.render("menulist", {
                menu_infos : menu_info[0],
                signinStatus: req.session.uid,
            });
        } else {
            const menu_info = await pool.query(
                'select menuID, menuName, menuPrice, menuKind from menu'
            );
            // console.log(menu_info[0]);
            return res.render("menulist", {
                menu_infos : menu_info[0],
                signinStatus: false,
            });

        }
    } catch (error) {
        console.log(error);
    }
}

exports.searchMenu = async (req, res) => {
    try {
        const { search } = req.body;
        if (search == "") {
            return res.redirect("/menulist");
        } else {
            const searchMenu = await pool.query(
                "select * from menu where menuName like ?",
                ["%" + search + "%"]
            );
            return res.render("menulist", {
                menu_infos : searchMenu[0],
                signinStatus : req.session.uid,
            })
        }
    } catch (error) {
        console.log(error);
    }
}

exports.menuDetail = async (req, res) => {
    try {
        const menu_id = req.params;
        const menu_info = await pool.query(
            'select * from menu where menuID = ?',
            [menu_id.menuID]
            );

        return res.render("menudetail", {
            menu_infos : menu_info[0][0],
            signinStatus : req.session.uid,
        });
    } catch (error) {
        console.log(error);
    }
}

exports.addBasket = async (req, res) => {
    try {
        if (req.session.uid){

            const menu_id = req.params;
            const { quantity } = req.body;
    
            const duplication_basket_info = await pool.query(
                'select * from `basketdetail` where user_uid = ? and menu_menuID = ?',
                [req.session.uid, menu_id.menuID]
            );
    
            if (duplication_basket_info[0].length !== 0) {
    
                await pool.query(
                    'update `basketdetail` set basketQuantity = ? where user_uid = ? and menu_menuID= ?',
                    [parseInt(duplication_basket_info[0][0].basketQuantity) + parseInt(quantity), req.session.uid, menu_id.menuID]
                    );
                
            } else {
                await pool.query(
                        'insert into basketdetail (menu_menuID, user_uid, basketQuantity) value (?, ?, ?)',
                        [menu_id.menuID, req.session.uid, quantity]
                    );
            }
    
            return res.redirect("/menulist")
        } else {
            res.redirect("/menulist");
        }
    } catch (error) {
        console.log(error);
    }
}

exports.directorder = async (req, res) => {
    try {
        const  menu_id  = req.params;
        const { quantity } = req.body;

        const menu_info = await pool.query(
            'select * from `menu` where menuID = ?',
            [menu_id.menuID]
        )
        
        const ss_info = await pool.query(
            'select orderID from `order` where orderDate is null'
        );
        
        for (var i = 0; i < ss_info[0].length; i++){
            await pool.query(
                'delete from `detail` where order_orderID = ?',
                [ss_info[0][i].orderID]
            )
            
            await pool.query(
                'delete from `order` where orderID = ?',
                [ss_info[0][i].orderID]
            )
        };

        const orderid_info = await pool.query(
            'select orderID from `order` order by orderID desc limit 1;'
        )
        const order_id = orderid_info[0][0].orderID + 1;


        if (req.session.uid){
            await pool.query(
                'insert into `order` (totalMoney, user_uid, orderID) value (?, ?, ?)',
                [menu_info[0][0].menuPrice * quantity, req.session.uid, order_id]
            );
        } else {
            await pool.query(
                'insert into `order` (totalMoney, user_uid, orderID) value (?, ?, ?)',
                [menu_info[0][0].menuPrice * quantity, "비회원", order_id]
            );
        }

        
        const order_info = await pool.query(
            'select * from `order`'
        )

        await pool.query(
            'insert into `detail` (menu_menuID, order_orderID, orderQuantity, orderPrice) value (?, ?, ?, ?)',
            [menu_id.menuID, order_info[0][order_info[0].length - 1].orderID, quantity, menu_info[0][0].menuPrice ]
        );

        return res.render("order",{
            menu_infos : menu_info[0][0],
            quantity : quantity,
            basketStatus: false,
            signinStatus : req.session.uid,
        });
    } catch (error) {
        console.log(error)
    }
}

exports.representativeMenu = async (req, res) => {
    try {
        const menu_id = req.params;
        console.log("대표로");
        await pool.query(
            'update `menu` set specialMenu = ? where menuID = ?',
            ["대표", menu_id.menuID]
        );

        return res.redirect("/menulist");

    } catch (error) {
        console.error(error);
    }
}

exports.RecommendedMenu = async (req, res) => {
    try {
        const menu_id = req.params;
        await pool.query(
            'update `menu` set specialMenu = ? where menuID = ?',
            ["추천", menu_id.menuID]
        );

        const recipe_info = await pool.query(
            'select * from recipe where menu_menuID = ?',
            [menu_id.menuID]
        );

        for (var i = 0; i < recipe_info[0].length; i++) {
            const ingredient_info = await pool.query(
                'select * from `ingredient` where ingredientName = ?',
                [recipe_info[0][i].ingredient_ingredientName]
            );
            console.log(30 * recipe_info[0][i].needQuantity);
            console.log(ingredient_info[0][0].reserves);
            if (30 * recipe_info[0][i].needQuantity > ingredient_info[0][0].reserves) {
                
                await pool.query(
                    'update `ingredient` set reserves =? where ingredientName = ?',
                    [ingredient_info[0][0].reserves + (30 * recipe_info[0][i].needQuantity), ingredient_info[0][0].ingredientName]
                );
    
                // 납기 DB에 넣기 위하여 공급처 불러오기
                const supply_info = await pool.query(
                    'select * from supplier where supply = ?',
                    [ingredient_info[0][0].ingredientName]
                )
                
                let date = new Date();
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString();
                const day = date.getDate().toString();
                const makeDate = year.concat("/", month).concat("/", day);
                await pool.query(
                    'insert into `delivery` (deliveryQuantity, deliveryPrice, deliveryDate, Supplier_supplierID, ingredient_ingredientName) values (?, ?, ?, ?, ?)',
                    [(30 * recipe_info[0][i].needQuantity), supply_info[0][0].supplyPrice * (30 * recipe_info[0][i].needQuantity), makeDate, supply_info[0][0].supplierID, ingredient_info[0][0].ingredientName]
                );
            }
        };

        return res.redirect("/menulist");
    } catch (error) {
        console.log(error);
    }
}