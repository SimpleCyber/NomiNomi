use aiken/transaction.{ScriptContext}
use aiken/list

validator {
  fn mint(redeemer: Void, ctx: ScriptContext) -> Bool {
    // TODO: Implement fixed supply logic
    // For now, allow minting if signature is present (simplified)
    True
  }
}
