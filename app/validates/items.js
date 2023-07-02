const {body} = require('express-validator');
const util = require('util');
const notify = require(__path_configs + 'notify');

const options = {
    name: { min: 5, max: 20 },
    ordering: { min: 0, max: 100 },
    status: {value: 'novalue'}
}

module.exports = {
    validator: () => {
        return [
            // NAME
            body('name')
                .isLength({min: options.name.min, max: options.name.max})
                .withMessage(util.format(notify.ERROR_NAME, options.name.min, options.name.max)),

            // ORDERING
            body('ordering')
                .isInt({gt: options.ordering.min, lt: options.name.max })
                // .isInt({ min: 1, max: 99 })
                .withMessage(util.format(notify.ERROR_ORDERING, options.ordering.min, options.ordering.max)),

            // STATUS
            body('status')
                .not().equals(options.status.value)
                .withMessage(notify.ERROR_STATUS),
        
        ]
    }
}