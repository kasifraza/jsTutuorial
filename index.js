const { v4: uuidv4 } = require('uuid');
let uniqueOrderId = uuidv4();
const dummyCartItems = [
    {
        id: 1,
        name: "Product A",
        price: 19.99,
        quantity: 2,
        subtotal: 39.98
    }
];



// creating promise and using promise

// create a promise
const createOrders = (cartDetails) => {
    let genratingOrderId = new Promise((resolve, reject) => {
        if (!cartDetails) {
            reject(new Error('Cart details not available!'));
        }
        setTimeout(()=>{
            resolve(uniqueOrderId);
        },5000);
    });
    return genratingOrderId;
};


// use a promise
let orderDetails = createOrders(dummyCartItems);

orderDetails.then((orderId) => {
    console.log(orderId);
}).then((error)=>{
    console.log(error);
})