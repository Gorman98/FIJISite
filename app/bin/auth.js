const jwt = require("jsonwebtoken");
const CONSTANTS = require("../config/CONSTANTS")
const Admin = require("../models/adminmodel")
var uniqid = require('uniqid');

/**
 * @author Joe Passanante
 */
const AuthorizedIds = {}

module.exports = {
    /**
     * @author Joe Passanante
     * @returns {Promise<JsonWebKey>}
     */
    createToken() {
        return new Promise((resolve, reject) => {
            let id = uniqid()
            var token = jwt.sign({ userid: id }, CONSTANTS.secret);
            resolve(token);
        })
    },
    /**
     * @author Joe Passanante
     */
    decodeToken(token) {
        var decoded = jwt.decode(token, { complete: true });
        console.log(decoded.header);
        console.log(decoded.payload)
        return new Promise((resolve, reject) => {
            jwt.verify(token, CONSTANTS.secret, function (err, decoded) {
                if (err) {
                    return reject(err);
                }
                return resolve(decoded);
            });

        })
    },
    /**
     * @author Joe Passanante
     * @param {} req 
     * @param {*} res 
     * @param {*} next 
     */
    checkAdmin(req, res, next) {
        //get token
        var cookie = req.cookies[CONSTANTS.cookieName];
        if (cookie === undefined) {
            return res.status(401).send("No token present. ")
        }
        let token = req.cookies[CONSTANTS.cookieName];
        return new Promise((resolve, reject) => {
            module.exports.decodeToken(token)
                .then(decodedToken => {
                    //great we have the decoded token, and its valid - lets get the ID
                    let id = this.decodeToken.userid;
                    if (AuthorizedIds.hasOwnProperty(id)) {
                        return next();
                    } else {
                        return res.status(401).send("No token present. ")
                    }
                })
                .catch(err => {
                    return res.status(401).send("No token present. ")
                })
        })
    },
    /**
     * 
     * @param {String} id 
     * @todo This needs to link up with the admin database.
     * @param {String} username 
     * @param {String} password 
     */
    login(id,username, password) {
        return new Promise((resolve,reject)=>{
            if(username=="testing" && password == "password"){
                AuthorizedIds[id] = {date: new Date()};
                resolve(true);
            }else{
                reject(new Error("Not Authorized."))
            }
        })
    },
    /**
     * @author Joe Passanante
     * @param {String} id 
     */
    logout(id){
        return new Promise((resolve,reject)=>{
            if(AuthorizedIds.hasOwnProperty(id)){
                delete AuthorizedIds.id;
                resolve(true)
            }else{
                reject(new Error("No id found."))
            }
        })
    }
}