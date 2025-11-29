use aiken/list
use aiken/transaction.{ScriptContext, OutputReference}

validator(utxo_ref: OutputReference) {
  fn mint(_redeemer: Void, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, .. } = ctx
    
    // Check if the specified UTxO is consumed in this transaction
    list.any(transaction.inputs, fn(input) { input.output_reference == utxo_ref })
  }
}
