// this is tutorial for understanding of poromis chaning in javascript

const fs = require('fs');
const path = require('path');

let CSV_DATA = fs.readFileSync(path.join(__dirname, '../data.csv'), 'utf8');
/*
add item to cart
create order,
proceedToPayment,
showOrderSummary,
updateWallet
*/

