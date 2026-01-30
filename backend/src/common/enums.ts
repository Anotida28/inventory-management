// src/common/enums.ts
export enum TransactionType {
  RECEIVE = 'RECEIVE',
  ISSUE = 'ISSUE',
  ADJUSTMENT = 'ADJUSTMENT',
  REVERSAL = 'REVERSAL'
}

export enum TransactionStatus {
  POSTED = 'POSTED',
  REVERSED = 'REVERSED'
}

export enum IssuedToType {
  BRANCH = 'BRANCH',
  PERSON = 'PERSON'
}