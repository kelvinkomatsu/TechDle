# Techdle – Modularization (v2.3 refactor)

This refactor splits **hardware.css** and **game.js** into small, reusable modules so
you can share pieces across new pages.

## New JS structure (ES Modules)

```
v2/js/
  main.js                        # Entry point (per-page). Minimal: calls initGame().
  modules/
    state.js                     # CONFIG + COLUMNS + in-memory state
    data.js                      # loadData() – fetch componentes.json
    logic/
      compare.js                 # compareCell() + compareRow()
    ui/
      table.js                   # renderHeader(), renderAttemptRow()
      combo.js                   # initCombo() – input + filtered list
    utils/
      text.js                    # stripDiacritics(), normalize(), tokenize(), sameItem()
      dom.js                     # $, $$, h()
    controllers.gameController.js# initGame() wires everything
```

## New CSS structure

```
v2/css/
  tokens.css            # variables
  base.css              # reset + base elements
  components.table.css  # attempts table
  components.combo.css  # combo input/list
  theme.hardware.css    # the original hardware.css kept intact for now
```

> You can progressively move styles **from theme.hardware.css** into the
> token/base/components files as you generalize them for other pages.

## How to update your HTML

In `v2/hardware.html`:
- `<link href="css/hardware.css">` → now loads `tokens.css`, `base.css`, component CSS and `theme.hardware.css`.
- `<script src="js/game.js"></script>` → replaced by `<script type="module" src="js/main.js"></script>`.

Other pages can reuse the same `main.js` or write their own entry that imports only the pieces they need.

## Notes

- The game logic now prevents additional guesses after a win/lose and disables the form.
- The combo supports typing to filter + keyboard navigation.
- Everything is JSDoc commented to clarify inputs/outputs/side effects.
