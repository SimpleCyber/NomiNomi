
/// Linear Bonding Curve Math
/// Price = slope * supply
/// Cost = integral(price) = 0.5 * slope * (new_supply^2 - current_supply^2)

pub const slope = 100 // 0.0001 ADA per token (scaled)

// Calculate cost in Lovelace to buy 'amount' tokens
pub fn calculate_cost(current_supply: Int, amount: Int) -> Int {
  let new_supply = current_supply + amount
  // Cost = 0.5 * slope * (new_supply^2 - current_supply^2)
  // We use integer arithmetic, so we divide by 2 at the end.
  // Scaling might be needed for precision, keeping it simple for now.
  let cost = (slope * (new_supply * new_supply - current_supply * current_supply)) / 2
  cost
}

// Calculate refund in Lovelace when selling 'amount' tokens
pub fn calculate_refund(current_supply: Int, amount: Int) -> Int {
  let new_supply = current_supply - amount
  // Refund is same formula as cost, just moving backwards on curve
  let refund = (slope * (current_supply * current_supply - new_supply * new_supply)) / 2
  refund
}
