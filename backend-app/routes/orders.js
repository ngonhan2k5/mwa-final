const express = require('express');
const router = express.Router();
const OrderService = require('../services/orderService');
const Mail = require('../utils/mail');
const farmerOnly = require('../middlewears/farmerOnly');
const customerOnly = require('../middlewears/customerOnly');

router.post('/sendmailtest', function (req, res, next) {
    console.log('ddd')
    let body = req.body;
    Mail.sendMail(body, (result) => {
        res.json(result)
    });

})

router.get('/:id', function (req, res, next) {
    const { id } = req.params
    OrderService.getById(id, (err, orders) => {
        res.json(orders)
    })
});

router.get('/', function (req, res, next) {
    const query = req.query;
    console.log(101010, query)
    OrderService.getByQuery(query, (err, orders) => {
        res.json(orders)
    })
});

// Create new order when check out
router.post('/', customerOnly, async function (req, res, next) {
    const { customerId, farmerId, orderItems } = req.body;
    let result = await OrderService.createOrder(customerId, farmerId, orderItems);
    if (result.error)
        return next(result)

    res.json(result);

});

router.put('/:id/rate/:rate', customerOnly, async function (req, res, next) {
    const { id, rate } = req.params;

    let result = await OrderService.rateOrder(id, rate);
    if (result.error)
        return next(result)

    res.json(result);

});

// update orders
router.put('/:id', farmerOnly, function (req, res, next) {

    let data = req.query;
    let { id } = req.params;

    console.log('PUT', id, data)

    OrderService.update(id, data, (err, result) => {
        if (err)
            next(err);

        res.json(result);
    })

});

// router.delete('/:id', function (req, res, next) {
//     let id = req.params.id;
//     OrderService.remove(id, () => { })
// });

module.exports = router;