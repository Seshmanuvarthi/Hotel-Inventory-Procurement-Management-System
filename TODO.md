# TODO: Implement Bar Item Feature with Quantity per Bottle

## Tasks
- [ ] Update AddItemPage.jsx: Add "bar" to categories, add bottleSize to state, conditionally render bottleSize input, update submission
- [ ] Update EditItemPage.jsx: Same changes as AddItemPage.jsx
- [ ] Update itemController.js: Modify createItem and updateItem to handle bottleSize
- [ ] Update ConsumptionEntry.jsx: Add bottles field for bar items, set unit to ml, calculate quantityConsumed, make it read-only

## Followup Steps
- [ ] Test adding a bar item with bottle unit and entering quantity per bottle
- [ ] Test consumption entry for bar items to ensure bottles field appears and calculations are correct
- [ ] Verify that stock balances are calculated properly in ml for bar items
