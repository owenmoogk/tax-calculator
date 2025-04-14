import { NonNegativeFirstArg } from "../util";
import { Account, TransactionReturn } from "./types";

const GovernmentMatchFraction = 0.2
const GovernmentMatchMaximum = 2500

export class RESP extends Account{

    EAPAmount: number
    GovernmentMatched: number // max 2500 per year (500 deposited)

    constructor(initialAmount: number, initialContributionAmount: number, interest: number){
        super(interest)
        this.value = initialAmount
        this.EAPAmount = initialAmount - initialContributionAmount
        this.GovernmentMatched = 0
    }

    @NonNegativeFirstArg
    addMoney(amount: number): TransactionReturn{
        this.value += amount
        if (this.GovernmentMatched < GovernmentMatchMaximum){
            if (amount + this.GovernmentMatched < GovernmentMatchMaximum){
                const matchValue = amount * GovernmentMatchFraction

                this.value += matchValue
                this.EAPAmount += matchValue

                this.GovernmentMatched += amount
            }
            else{
                const valueToMatch = GovernmentMatchMaximum - this.GovernmentMatched
                const matchValue = valueToMatch * GovernmentMatchFraction

                this.value += valueToMatch
                this.EAPAmount += matchValue

                this.GovernmentMatched += amount
            }
        }
        return {moneyOut: -amount, taxableIncome: 0, realizedCapitalGains: 0}
    }

    withdrawal(amount: number): TransactionReturn{
        if (amount > this.value) throw Error(`Withdrawal cannot exceed value of account (RESP): Amount remaining: ${this.value}, Amount Requested: ${amount}`)
        const eapFraction = this.EAPAmount / this.value;
        this.EAPAmount -= amount * eapFraction
        this.value -= amount;
        return { moneyOut: amount, taxableIncome: amount * eapFraction, realizedCapitalGains: 0}
    }

    newYear(){
        super.newYear()
        this.GovernmentMatched = 0
    }
}