"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuedToType = exports.TransactionStatus = exports.TransactionType = void 0;
// src/common/enums.ts
var TransactionType;
(function (TransactionType) {
    TransactionType["RECEIVE"] = "RECEIVE";
    TransactionType["ISSUE"] = "ISSUE";
    TransactionType["ADJUSTMENT"] = "ADJUSTMENT";
    TransactionType["REVERSAL"] = "REVERSAL";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["POSTED"] = "POSTED";
    TransactionStatus["REVERSED"] = "REVERSED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var IssuedToType;
(function (IssuedToType) {
    IssuedToType["BRANCH"] = "BRANCH";
    IssuedToType["PERSON"] = "PERSON";
})(IssuedToType || (exports.IssuedToType = IssuedToType = {}));
