const pool = require('../../middleware/db');

exports.reportPage = async (req, res) => {
    try {
        const supply_info = await pool.query(
            'select * from `delivery`'
        )

        return res.render('supplyreport', {
            supply_infos : supply_info[0],
        });
    } catch (error) {
        console.log(error);
    }
}