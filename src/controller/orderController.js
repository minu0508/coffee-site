const pool = require('../../middleware/db');

exports.orderPage = async (req, res) => {
    try {
        if (req.session.uid) {
            return res.render('order', {
                signinStatus: req.session.uid,
            });
        } else {
            return res.render('order', {
                signinStatus: false,
            });
        }
    } catch (error) {
        console.log(error);
    }
}

exports.direct = async (req, res) => {
    try {
        // 날짜
        let date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        const makeDate = year.concat("/", month).concat("/", day);

        const { choice, cardInput} = req.body;

        // 날짜, 결제방식이 NULL인데 값 넣어주기 위해서 order 테이블 불러옴.
        const order_info = await pool.query(
            'select * from `order`'
        )

        await pool.query (
            'update `order` set orderDate = ?, paymentKind = ? where orderID = ?',
            [makeDate, choice, order_info[0][order_info[0].length - 1].orderID]
        );

        // 최종 구매 결과를 나타내는 result.ejs로 아래 테이블들 보낼려고 부름
        const result_info = await pool.query(
            'select * from `order`'
        );

        console.log(result_info[0][result_info[0].length - 1].orderID);

        // orderID를 오름차순으로 볼려고
        const detail_info = await pool.query(
            'select * from `detail` order by order_orderID asc'
        );

        console.log(detail_info[0][detail_info[0].length - 1].menu_menuID);
        console.log(detail_info[0][detail_info[0].length - 1].orderQuantity);

        const menu_info = await pool.query(
            'select menuName, menuPrice from `menu`'
        );

        const recipe_info = await pool.query(
            'select * from recipe where menu_menuID = ?',
            [detail_info[0][detail_info[0].length - 1].menu_menuID]
        );

        console.log(recipe_info[0]);

        for (var j = 0; j < recipe_info[0].length; j++) {
            const reserves_info = await pool.query(
                'select reserves from `ingredient` where ingredientName = ?',
                [recipe_info[0][j].ingredient_ingredientName]
            );

            console.log(reserves_info[0])

            await pool.query(
                'update `ingredient` set reserves = ? where ingredientName = ?',
                [reserves_info[0][0].reserves  - (detail_info[0][0].orderQuantity * recipe_info[0][j].needQuantity), recipe_info[0][j].ingredient_ingredientName]
            );
        };

        if (req.session.uid) {
            return res.render("result",{
                result_infos : result_info[0],
                detail_infos : detail_info[0],
                menu_infos : menu_info[0],
                basketStatus: false,
                signinStatus: req.session.uid,
            });
        } else {
            return res.render("result",{
                result_infos : result_info[0],
                detail_infos : detail_info[0],
                menu_infos : menu_info[0],
                basketStatus: false,
                signinStatus: false,
            });
        }
    } catch (error) {
        console.log(error)
    }
}

exports.ordering = async (req, res) => {
    try {
        const { choice, cardInput} = req.body;

        // 날짜 생성
        let date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();
        const day = date.getDate().toString();
        const makeDate = year.concat("/", month).concat("/", day);
        var totalMoney = 0;


        // 로그인한 회원이 장바구니에 담아둔 항목 정보 모두 검색
        const basket_info = await pool.query(
            'select * from basketdetail where user_uid = ?',
            [req.session.uid]
        );
        

        // menu 테이블에서 menu 정보들 모두 검색
        const menu_info = await pool.query(
            'select * from menu'
        );


        /**  
         * [ss_info]
         * ---
         * 바로 구매 시 다른 페이지로 이동 시 null 값이 order에 존재한다.
         * 해당 null 값을 없애고, 해당 Row 때문에 자동으로 +1 해준 orderID를
         * 정상적으로 복구한다.
        */
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



        // 장바구니에 들어간 항목들의 총 금액이다.
        for (var i=0; i < basket_info[0].length; i++) {
            // console.log(menu_info[0][basket_info[0][i].menu_menuID - 1].menuPrice * basket_info[0][i].basketQuantity);
            totalMoney += menu_info[0][basket_info[0][i].menu_menuID - 1].menuPrice * basket_info[0][i].basketQuantity;
        }



        // order 테이블에 속성에 대한 모든 정보를 입력
        await pool.query(
            "insert into `order` (orderDate, paymentKind, totalMoney, user_uid, orderID) values (?, ?, ?, ?, ?)",
            [makeDate, choice, totalMoney, req.session.uid, order_id]
        );


        // order 테이블에 모든 속성 입력 후 해당 
        const result_info = await pool.query(
            "select * from `order` where user_uid = ?",
            [req.session.uid]
        );


        // 위에 중복됨.
        // const basket_infos = await pool.query(
        //     'select * from basketdetail where user_uid = ?',
        //     [req.session.uid]
        // );
        
        // detail 테이블에도 각각 주문 항목들 입력
        for (var i=0; i < basket_info[0].length; i++) {
            // console.log(menu_info[0][basket_info[0][i].menu_menuID - 1].menuPrice * basket_info[0][i].basketQuantity);
            var orderMoney = menu_info[0][basket_info[0][i].menu_menuID - 1].menuPrice * basket_info[0][i].basketQuantity;
            await pool.query (
                'insert into `detail` (menu_menuID, order_orderID, orderQuantity, orderPrice) value (?, ?, ?, ?)',
                [basket_info[0][i].menu_menuID, result_info[0][result_info[0].length - 1].orderID, basket_info[0][i].basketQuantity, orderMoney]
            );

        };
        

        // 장바구니에 있던 항목들 삭제
        await pool.query (
            'delete from basketdetail where user_uid = ?',
            [req.session.uid]
        );


        // 해당 orderID에 해당하는 항목들 detail 테이블에서 모두 불러오기
        const detail_info = await pool.query(
            'select * from `detail` where order_orderID = ?',
            [result_info[0][result_info[0].length - 1].orderID]
        );
        
        // orderID에 해당하는 것들 order 테이블에서 검색
        const order_info = await pool.query(
            'select orderDate, paymentKind, orderID, totalMoney from `order` where orderID = ?',
            [result_info[0][result_info[0].length - 1].orderID]
        );

        // console.log(ingredient_info[0]);
        for (var i = 0; i < basket_info[0].length; i++) {
            // recipe 정보 불러오기
            const recipe_info = await pool.query(
                'select * from recipe where menu_menuID = ?',
                [basket_info[0][i].menu_menuID]
            );
                
            for (var j = 0; j < recipe_info[0].length; j++) {
                const reserves_info = await pool.query(
                    'select reserves from `ingredient` where ingredientName = ?',
                    [recipe_info[0][j].ingredient_ingredientName]
                );

                console.log(reserves_info[0])

                await pool.query(
                    'update `ingredient` set reserves = ? where ingredientName = ?',
                    [reserves_info[0][0].reserves  - (detail_info[0][i].orderQuantity * recipe_info[0][j].needQuantity), recipe_info[0][j].ingredient_ingredientName]
                );
            };
        };

        return res.render('result', {
            detail_infos : detail_info[0],
            menu_infos : menu_info[0],
            order_infos : order_info[0], 
            basketStatus: true,
            signinStatus : req.session.uid,
        });
    } catch (error) {
        console.log(error);
    }
}
