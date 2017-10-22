// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Http response
 *
 * @param bool
 * @param msg
 * @param res
 */
function response(bool, msg, res) {

    let responseMsg = 'index.js: storeData: RESPONSE: bool' + bool + 'Message:' + msg;
    console.log(responseMsg);

    res
        .status(bool ? 200 : 400)
        .send(responseMsg);
}


/**
 * Function to store data on endPoint
 *
 * @type {HttpsFunction}
 *
 * @param name, age
 */
exports.storeData = functions.https.onRequest((req, res) => {

    const db = admin.database();
    const ref = db.ref('/customer/');

    const name = req.query.name;
    const age = req.query.age;

    let customerObj = {name, age};
    console.log('storeData.js: customerObj:', customerObj);


    if (name === undefined) {
        response(false, 'storeData: name parameter not informed', res);
    } else if (age === undefined) {
        response(false, 'storeData: age parameter not informed', res);
    } else console.log('storeData: all parameters received');


    function storeCustomer(callback) {

        ref.push(customerObj,
            (errOrNull) => {
                console.log('errOrNull:', errOrNull);
                errOrNull === null ? callback(true, errOrNull, res) : callback(false, errOrNull, res);
            });
    }

    storeCustomer(response);
});


exports.resetCustomerDB = functions.https.onRequest((req, res) => {

    const db = admin.database();
    const ref = db.ref('/customer/');

    const areYouSure = req.query.areYouSure;
    console.log('areYouSure: ', areYouSure);

    function resetDB() {

        ref
            .set(null)
            .then(
                result => {
                    let msg = 'successfully reset DB: result: ' + result;
                    console.log(msg);
                    response(true, msg, res);
                },
                result => {
                    let msg = 'not successful to reset DB: result: ' + result;
                    console.log(msg);
                    response(false, msg, res);
                });
    }

    if (areYouSure === 'true') {
        resetDB();
    } else {
        response(false, 'value not true', res);
    }
});