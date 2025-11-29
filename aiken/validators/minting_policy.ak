use aiken/stdlib.{Data}
use aiken/cardano/transaction.{ScriptContext, OutputReference}

validator(_utxo_ref: OutputReference) {
  fn mint(_redeemer: Data, _ctx: ScriptContext) -> Bool {
    True
  }
}
