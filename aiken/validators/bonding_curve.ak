use aiken/transaction.{ScriptContext}

type State {
  Funding
  ReadyForLP
  Live
}

type Datum {
  circulating: Int,
  raised_lovelace: Int,
  max_supply: Int,
  funding_goal_lovelace: Int,
  status: State,
}

type Redeemer {
  Buy { amount_out: Int }
  LaunchLP
}

validator {
  fn spend(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
    // TODO: Implement bonding curve logic
    True
  }
}
