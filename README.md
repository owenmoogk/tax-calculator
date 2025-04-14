# Tax Calculator
Making this so I can do some serious monte-carlo simulations.

### CPP
Modelled using Grok, can't confirm it's accuracy yet

### EI Payments
Just put under the tax section

### Tax Brackets
Pulled from the Ontario and Canada website a few years ago.

## TODO
- Need to scale all of the gov't numbers to account for inflation, bc TFSA contribution room will probably rise.
- Add an input where a user can select how much to put in where each year
- Allow a user to delay their CPP if they believe they will live longer (and will benefit more)
- Add OAS
- Add FHSA
- Add a mortgage plan in
- Think about adding a potential inheritance (or multiple)
- Add the ability to have kids, and put money in their RESP
- Implement tuition tax breaks
- Travel tax breaks should be easy

- Refactor the apply transaction function
- Refactor how years are dealth with, should probably zero index and then just use offsets for display.
- Add the decorator to allow for non-negative checking