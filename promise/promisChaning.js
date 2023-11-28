// this is tutorial for understanding of poromis chaning in javascript

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const CSV_DATA = fs.readFileSync(path.join(__dirname, '../data.csv'), 'utf8').toLocaleString();
/*
add item to cart
create order,
proceedToPayment,
showOrderSummary,
updateWallet
*/
let products = [];
let orders = [];
let walletBalance = 100;

const generateProducts = async () => {
    let rows = CSV_DATA.split("\n");
    rows.forEach((row, index) => {
        if (index === 0) {
            // Skip processing for the first row (index 0) because it have csv header like invoiceNumber,producName,quantity
            return;
        }
        columns = row.split(","); //SPLIT COLUMNS

        let currentProduct = {
            invoiceNumber: columns[0],
            stockCode: columns[1],
            productName: columns[2],
            quantity: columns[3],
            price: columns[5],
            customerId: columns[6],
            walletBalance
        };
        products.push(currentProduct);
    });
};
generateProducts();

const randomProductToAddIntoCart = () => {
    const randomIndex = Math.floor(Math.random() * products.length);
    return { ...products[randomIndex], productIndex: randomIndex };
};

const generateOrderId = () => {
    return uuidv4();
}

//  main promise chaining code is starting here

let addToCartPromise = () => {
    return new Promise((resolve, reject) => {
        let addingProductInfo = randomProductToAddIntoCart();
        resolve(addingProductInfo);
    });
}

// create order promis creating
const createOrderPromise = (cartItems) => {
    return new Promise((resolve, reject) => {
        if (!cartItems || cartItems.length === 0) {
            reject(new Error('Cart not created or may Cart Items dit not provided!'));
        }
        let orderId = generateOrderId();
        let creatingOrderWithPaymentPending = { ...cartItems, paymentStatus: 'pending', orderId: orderId };
        orders.push(creatingOrderWithPaymentPending);
        resolve(creatingOrderWithPaymentPending);
    });
}


// proceeding to payment

const proceedToPaymentPromise = (createdOrderDetails) => {
    return new Promise((resolve, reject) => {
        if (!createdOrderDetails) {
            reject(new Error('Order not created'));
        }
        const { quantity, price } = createdOrderDetails;
        if (!quantity || !price) {
            reject(new Error('There is no quantity or item may out of stock'));
        }
        let totalPayableAmount = parseFloat(quantity) * parseFloat(price);
        resolve({ ...createdOrderDetails, paymentStatus: 'paid', totalPaidAmount: totalPayableAmount });
    });
};

const updateOrdersTablePromise = (paidOrderDetails) => {
    return new Promise((resolve, reject) => {
        if (!paidOrderDetails) {
            reject(new Error('Payment Failed or something went wrong while payment made!'));
        }
        const indexToUpdateOrdersArray = orders.findIndex(order => order.orderId === paidOrderDetails.orderId);
        if (indexToUpdateOrdersArray !== -1) {
            orders[indexToUpdateOrdersArray] = paidOrderDetails;
            resolve(orders[indexToUpdateOrdersArray].orderId);
        } else {
            reject(new Error('These Order Details not found in orders table!'));
        }

    })
};


const checkWalletAndUpdateWallet = (orderDetails) => {
    return new Promise((resolve, reject) => {
        if (walletBalance < orderDetails['totalPaidAmount']) {
            reject(new Error('Insufficient wallet balance'));
        } else {
            walletBalance -= orderDetails['totalPaidAmount'];
            const indexToUpdateOrdersArray = orders.findIndex(order => order.orderId === orderDetails.orderId);
            if (indexToUpdateOrdersArray !== -1) {
                orders[indexToUpdateOrdersArray] = { ...orderDetails, walletBalance };
                resolve(orders[indexToUpdateOrdersArray]);
            } else {
                reject(new Error('Product not found in orders table in checkWalletAndUpdateWallet promise'));
            }
        }
    });
}



const showOrderSummaryPromise = (orderId) => {
    return new Promise((resolve, reject) => {
        if (!orderId) reject(new Error('Order Id is required to see order summary!'));
        const orderSummary = orders.findIndex(order => order.orderId === orderId && order.paymentStatus === 'paid');
        if (orderSummary !== -1) {
            resolve(orders[orderSummary]);
        } else {
            reject(new Error('Order not found or may be payment did not completed!!!! in showOrderSummaryPromise promise'));
        }
    });
}

// const addToCart = addToCartPromise();    // you can write like this 


addToCartPromise()
    .then((cartItem) => {
        // after added to cart
        return createOrderPromise(cartItem);    // you may remove cartItem from passing parameter in createOrderPromise to see reject 
    })
    // this catch will handle error of createOrderPromise only
    .catch((error) => {
        console.error(`Error while creating order: ${error.message}`);
    })
    .then((createOrderDetails) => {
        //processing payment
        return proceedToPaymentPromise(createOrderDetails);
    })
    .catch((error) => {
        //catching error of processing payment
        console.error(`Error while processing payment: ${error.message}`);
    })
    .then((paymentDetails) => {
        return checkWalletAndUpdateWallet(paymentDetails);
    })
    .catch((error) => {
        // this catch will handle error of checkWalletAndUpdateWallet only
        console.error(`Error while checking walllet balance and updating wallet: ${error.message}`);
    })
    .then((paymentDetailsWithUpdatedWalletBalance) => {
        // this will update orders array with payment details
        return updateOrdersTablePromise(paymentDetailsWithUpdatedWalletBalance);
    })
    .catch((error) => {
        // this will handle error of updating orders array
        console.error(`Error while updating order table: ${error.message}`);
    })
    .then((orderId) => {
        return showOrderSummaryPromise(orderId);
    })
    .then((orderSummary) => {
        console.table(orderSummary);
    })
    .then(() => {
        console.log('I dont care about order i will run if in my above chaning error not occurred')
    })
    .catch((error) => {
        console.error('this will handle all error across these chaning');
    });
