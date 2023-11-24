const pool = require('../../middleware/db');

exports.ingredientPage = async (req, res) => {
    try {
        const ingredient_info = await pool.query(
            'select * from `ingredient`'
        )
        return res.render("ingredientmanagement", {
            ingredient_infos : ingredient_info[0],
        });
    } catch (error) {
        console.log(error);
    }
}

exports.addIngredient = async (req, res) => {
    try {
        const ingredient_Name = req.params;
        const { addQuantity } = req.body;

        if (addQuantity != 0){
            // 보유량을 증가시키기 위하여 재료 이름 불러오기.
            const ingredient_info = await pool.query(
                'select reserves from `ingredient` where ingredientName = ?',
                [ingredient_Name.ingredientName]
            );
            console.log(ingredient_info[0][0].reserves + Number(addQuantity));

            // 불러온 재료 이름으로 재료 테이블에 보유량 증가.
            await pool.query(
                'update `ingredient` set reserves =? where ingredientName = ?',
                [ingredient_info[0][0].reserves + Number(addQuantity), ingredient_Name.ingredientName]
            );

            // 납기 DB에 넣기 위하여 공급처 불러오기
            const supply_info = await pool.query(
                'select * from supplier where supply = ?',
                [ingredient_Name.ingredientName]
            )
            console.log(supply_info[0][0]);
            
            let date = new Date();
            const year = date.getFullYear().toString();
            const month = (date.getMonth() + 1).toString();
            const day = date.getDate().toString();
            const makeDate = year.concat("/", month).concat("/", day);
            await pool.query(
                'insert into `delivery` (deliveryQuantity, deliveryPrice, deliveryDate, Supplier_supplierID, ingredient_ingredientName) values (?, ?, ?, ?, ?)',
                [addQuantity, supply_info[0][0].supplyPrice * addQuantity, makeDate, supply_info[0][0].supplierID, ingredient_Name.ingredientName]
            );

            return res.redirect("/ingredientmanagement");
        } else {
            return res.redirect("/ingredientmanagement");
        }
        // await pool.query(
            
        // )
        
    } catch (error) {
        console.log(error);
    }
}