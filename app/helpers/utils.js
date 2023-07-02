const ItemsModel = require(__path_schemas + 'items');


let createFilterStatus = async (currentStatus) => {
    let statusFilter = [
        { name: 'All', value: "all", count: 0, class: 'default' },
        { name: 'Active', value: "active", count: 0, class: 'default' },
        { name: 'Inactive', value: "inactive", count: 0, class: 'default' }
    ];

    // async await không ap dụng được với forEach
    // statusFilter.forEach(async (item, index) => {
    for(let index = 0; index < statusFilter.length; index++) {        
        let item = statusFilter[index];
        let condition = (item.value !== "all") ? {status: item.value} : {};
        if(item.value === currentStatus) statusFilter[index].class = "success";

        await ItemsModel.count(condition).then((data) => {
            statusFilter[index].count = data;
        });
    }

    return statusFilter;
}

// let createFilterStatus = async (currentStatus) => {
//     let statusFilter = [
//         { name: 'All', value: "all", count: 0, link: '#', class: 'default' },
//         { name: 'Active', value: "active", count: 0, link: '#', class: 'default' },
//         { name: 'Inactive', value: "inactive", count: 0, link: '#', class: 'default' }
//     ];

//     let promises = statusFilter.map(async (item, index) => {
//         let condition = {};
//         if (item.value !== "all") condition = { status: item.value };
//         if (item.value === currentStatus) statusFilter[index].class = "success";
//         let data = await ItemsModel.count(condition);
//         return data;
//     });

//     let countData = await Promise.all(promises);

//     statusFilter.forEach((item, index) => {
//         item.count = countData[index];
//     });

//     return statusFilter;
// }

module.exports = {
    createFilterStatus: createFilterStatus
}