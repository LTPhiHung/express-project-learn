var express = require('express');
var router = express.Router();
const {check, body, validationResult} = require('express-validator');
const util = require('util');

const systemConfig = require(__path_configs + 'system');
const notify = require(__path_configs + 'notify');
const ItemsModel = require(__path_schemas + 'items');
const ValidateItems = require(__path_validates + 'items');
const UtilsHelpers = require(__path_helpers + 'utils');
const ParamHelpers = require(__path_helpers + 'params');

// const ItemsModel = require('./../../schemas/items');
// const ValidateItems = require('./../../validates/items');
// const UtilsHelpers = require('./../../helpers/utils');
// const ParamHelpers = require('./../../helpers/params');
// const notify = require('./../../configs/notify');
// const systemConfig = require('../../configs/system');
const linkIndex = `/${systemConfig.prefixAdmin}/items/`;

const pageTitleIndex = 'Item Management';
const pageTitleAdd =  pageTitleIndex + ' - Add';
const pageTitleEdit =  pageTitleIndex + ' - Edit';
const folderView = __path_views + 'pages/items/';

// ( )? xuat hien cung dc, ko xuat hien cx dc
// router.get('(/:status)?', async (req, res, next) => {} : Nếu /add (hoặc / giá trị khác) sẽ trùng với đường dẫn này
router.get('(/status/:status)?', async (req, res, next) => {
    let objWhere = {};
    let keyword = ParamHelpers.getParam(req.query, 'keyword', '');
    // req.query : những gì người ta gửi lên     

    // let currentStatus = 'all';

    // if(req.params.hasOwnProperty('status') && req.params.status !== undefined) {
    //     currentStatus = req.params.status;
    // } 

    let currentStatus = ParamHelpers.getParam(req.params, 'status', 'all');
    let statusFilter = await UtilsHelpers.createFilterStatus(currentStatus);

    // all              objWhere = {}
    // !all             objWhere = { status: X}
    // keyword !== ''   objWhere = {name: keyword}
    // keyword === ''   objWhere = {}

    let pagination = {
        totalItems: 1,
        totalItemsPerPage: 3,
        currentPage: parseInt(ParamHelpers.getParam(req.query, 'page', 1)),
        pageRanges: 3
    };


    if(currentStatus !== 'all') objWhere.status = currentStatus;
    if(currentStatus !== '') objWhere.name = new RegExp(keyword, 'i');
    
    // C1:
     await ItemsModel.count(objWhere).then((data) => {
        pagination.totalItems = data;
    });

    ItemsModel
        .find(objWhere)
        .sort({ordering: 'asc'})
        .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage)
        .limit(pagination.totalItemsPerPage)
        .then((items) => {
            res.render(`${folderView}list`, {
                pageTitle: pageTitleIndex,
                items: items,
                statusFilter: statusFilter,
                pagination,
                currentStatus,
                keyword,
                // message: req.flash('info')
            });
        });

    // C2:
    // ItemsModel.count(objWhere).then((data) => {
    //     pagination.totalItems = data;
    //     ItemsModel
    //     .find(objWhere)
    //     .sort({ordering: 'asc'})
    //     .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage)
    //     .limit(pagination.totalItemsPerPage)
    //     .then((items) => {
    //         res.render(`${folderView}list`, {
    //             pageTitle: pageTitleIndex,
    //             items: items,
    //             statusFilter: statusFilter,
    //             pagination,
    //             currentStatus,
    //             keyword,
    //             // message: req.flash('info')
    //         });
    //     });
    // });
});

// Change status 
router.get('/change-status/:id/:status', (req, res, next) => {
    let currentStatus = ParamHelpers.getParam(req.params, 'status', 'active');
    let id = ParamHelpers.getParam(req.params, 'id', '');

    let status = (currentStatus === "active") ? "inactive" : "active";

    // console.log(req.app.locals.prefixAdmin);
    ItemsModel.updateOne({_id: id}, {status: status}).then( (err, result) => {
        // flash không cần render ra tập tin view nên truyền vào tham số thứ 3 là false
        req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
        res.redirect(linkIndex)
    });

    // C2:
    // ItemsModel.findById(id)
    //     .then((itemResult) => {
    //         itemResult.status = status;
    //         itemResult.save().then((result) => {
    //             res.redirect('/admin123/items/')
    //         })
    //     });

});

// Change status - Multi
router.post('/change-status/:status', (req, res, next) => {
    let currentStatus = ParamHelpers.getParam(req.params, 'status', 'active');
    // req.body: Lấy những dữ liệu lấy được từ form
    ItemsModel.updateMany({_id: {$in: req.body.cid}}, {status: currentStatus}).then((result) => {
        // console.log(result);
        req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.modifiedCount), false);
        res.redirect(linkIndex);
    });
});

// Change ordering - Multi
router.post('/change-ordering/', (req, res, next) => {
    let cids = req.body.cid;
    let orderings = req.body.ordering;

    if(Array.isArray(cids)) {
        cids.forEach((item, index) => {
            ItemsModel.updateOne({_id: item}, {ordering: parseInt(orderings[index])}).then( (result) => {

            });
        })
    } else {
        ItemsModel.updateOne({_id: cids}, {ordering: parseInt(orderings)}).then( (result) => {

        });
    }

    req.flash('success', notify.CHANGE_ORDERING_SUCCESS, false);

    res.redirect(linkIndex);

});

// Delete
router.get('/delete/:id', (req, res, next) => {
    let id = ParamHelpers.getParam(req.params, 'id', '');

    ItemsModel.deleteOne({_id: id}).then( (err, result) => {
        req.flash('success', notify.DELETE_SUCCESS, false);
        res.redirect(linkIndex)
    })
});

// Delete - Multi
router.post('/delete/', (req, res, next) => {
    // ItemsModel.remove({_id: {$in: req.body.cid}})
    ItemsModel.deleteMany({_id: {$in: req.body.cid}})
    .then( (result) => {
        console.log(result)
        req.flash('success', util.format(notify.DELETE_MULTI_SUCCESS, result.deletedCount), false);
        res.redirect(linkIndex);
    });
});

// FORM
router.get(('/form(/:id)?'), (req, res, next) => {
    let id = ParamHelpers.getParam(req.params, 'id', '');
    let item = {name: '', ordering: 0, status: 'novalue'};
    let errors = null;
    if(id === '') { //ADD
        res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors });
    } else { //EDIT
        ItemsModel.findById(id)
            .then((item) => {
                res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors });
            });
    }
});

// ADD = ADD EDIT
router.post('/save', ValidateItems.validator(), (req, res, next) => {
    // search: req.body.hasOwnProperty is not function
    req.body = JSON.parse(JSON.stringify(req.body));
    let item = Object.assign(req.body)

    if(typeof item !== "undefined" && item.id !== "") { // edit
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // error
            res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors: errors.errors });
        } else { //no error
            ItemsModel.updateOne({_id: item.id}, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status
            })
                .then( (result) => {
                    req.flash('success', notify.EDIT_SUCCESS, false);
                    res.redirect(linkIndex);
                })
        }
    } else { // add
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // error
            res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors: errors.errors });
        } else { //no error
            new ItemsModel(item).save()
            .then(() => {
                req.flash('success', notify.ADD_SUCCESS, false);
                res.redirect(linkIndex);
            })
        }
    }
});

module.exports = router;
