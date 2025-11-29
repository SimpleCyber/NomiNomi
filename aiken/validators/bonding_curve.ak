use aiken/cardano/transaction.{ScriptContext, InlineDatum}
use aiken/cardano/assets.{Value, PolicyId, AssetName}

// Types (kept for reference)

type State {
  Funding
  ReadyForLP
  Live
}

type Datum {
  circulating_supply: Int,
  reserve_lovelace: Int,
  max_supply: Int,
  funding_goal_lovelace: Int,
  state: State,
  token_policy_id: PolicyId,
  token_asset_name: AssetName,
}

type Redeemer {
  Buy { amount: Int }
  Sell { amount: Int }
  LaunchLP
}

validator {
  fn spend(_datum: Datum, _redeemer: Redeemer, _ctx: ScriptContext) -> Bool {
    True
  }
}
