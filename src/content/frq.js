// ============================================================================
// Free-Response Questions (FRQ) for the Advanced Track — the AP hallmark.
//
// Unlike the multiple-choice banks, these are open-ended, multi-part problems.
// A student works each part, then reveals a worked MODEL SOLUTION and an
// AP-style RUBRIC and self-scores (the honor-system method serious students use
// to prep). Kept fully separate from the K-12 adaptive ladder.
//
// Shape:
//   { id, track, topic, difficulty, calculator (bool|null),
//     prompt,                       // scenario / stimulus (may be '')
//     parts: [ { label, ask, solution, points } ],
//     maxPoints, note }
// For humanities (English/Spanish), a "part" is a rubric ROW; the solution is
// exemplar guidance the student scores their essay against.
// ============================================================================

const FRQ_BANKS = {
  // ---------------------------------------------------------------- AP Calculus AB
  'ap-calc-ab': [
    {
      id: 'apcalc-frq-related-rates', topic: 'Related Rates', difficulty: 'AP', calculator: false,
      prompt: 'Air is pumped into a spherical balloon so that its volume increases at a constant rate of 100 cubic centimeters per second. (The volume of a sphere is V = (4/3)πr³, and its surface area is A = 4πr².)',
      parts: [
        { label: '(a)', ask: 'Find the rate at which the radius is increasing at the instant when r = 5 cm.', points: 3,
          solution: 'Differentiate V = (4/3)πr³ with respect to time: dV/dt = 4πr² · dr/dt. Substitute dV/dt = 100 and r = 5: 100 = 4π(25) dr/dt = 100π · dr/dt, so dr/dt = 1/π ≈ 0.318 cm/s.' },
        { label: '(b)', ask: 'Find the rate at which the surface area is increasing at the same instant (r = 5).', points: 3,
          solution: 'A = 4πr² ⇒ dA/dt = 8πr · dr/dt. Using r = 5 and dr/dt = 1/π from (a): dA/dt = 8π(5)(1/π) = 40 cm²/s.' },
        { label: '(c)', ask: 'Is the radius increasing at an increasing or decreasing rate? Justify.', points: 3,
          solution: 'From dr/dt = (dV/dt)/(4πr²) = 25/(πr²), as r grows the denominator grows, so dr/dt decreases. The radius is increasing at a DECREASING rate (the balloon’s radius grows more slowly as it gets bigger, even though volume grows at a constant rate).' }
      ], maxPoints: 9, note: 'No calculator. Show the chain-rule setup before substituting numbers.'
    },
    {
      id: 'apcalc-frq-accumulation', topic: 'Accumulation & FTC', difficulty: 'AP', calculator: true,
      prompt: 'Water flows into a tank at a rate of R(t) = 20 + 10·sin(t/2) liters per hour, for 0 ≤ t ≤ 8 hours. The tank contains 50 liters of water at time t = 0.',
      parts: [
        { label: '(a)', ask: 'How many liters of water flow into the tank during the first 8 hours? Set up an integral and evaluate.', points: 3,
          solution: 'Amount = ∫₀⁸ (20 + 10 sin(t/2)) dt = [20t − 20 cos(t/2)]₀⁸ = (160 − 20 cos 4) − (0 − 20) = 180 − 20 cos(4) ≈ 180 − 20(−0.6536) ≈ 193.07 liters.' },
        { label: '(b)', ask: 'Write an expression for the total amount of water W(t) in the tank at time t.', points: 2,
          solution: 'W(t) = 50 + ∫₀ᵗ (20 + 10 sin(x/2)) dx. (Initial 50 liters plus accumulated inflow.)' },
        { label: '(c)', ask: 'At what time t in [0,8] is the water flowing in fastest? Justify.', points: 4,
          solution: 'R’(t) = 5 cos(t/2); this is zero when t/2 = π/2 ⇒ t = π ≈ 3.14. R is maximized where sin(t/2) = 1, i.e. t/2 = π/2, t = π. Check endpoints: R(π) = 30 is the max on [0,8] (R(0)=20, R(8)=20+10 sin4≈12.4). Fastest inflow is at t = π ≈ 3.14 hours, R ≈ 30 L/hr.' }
      ], maxPoints: 9, note: 'Graphing calculator allowed. Store answers to 3 decimals until the final step.'
    },
    {
      id: 'apcalc-frq-analysis', topic: 'Analysis of f, f’, f’’', difficulty: 'AP', calculator: false,
      prompt: 'Let f be a function with f(x) = x³ − 6x² + 9x + 2.',
      parts: [
        { label: '(a)', ask: 'Find all critical points and classify each as a local max or min.', points: 3,
          solution: 'f’(x) = 3x² − 12x + 9 = 3(x² − 4x + 3) = 3(x−1)(x−3). Critical x = 1, 3. f’ changes + → − at x=1 (local MAX, f(1)=6) and − → + at x=3 (local MIN, f(3)=2).' },
        { label: '(b)', ask: 'Find the interval(s) where f is concave up and any inflection point(s).', points: 3,
          solution: 'f’’(x) = 6x − 12 = 6(x−2). f’’ > 0 for x > 2, so f is concave up on (2, ∞). Inflection point at x = 2, f(2) = 8−24+18+2 = 4, i.e. (2, 4).' },
        { label: '(c)', ask: 'Find the absolute maximum of f on the closed interval [0, 4].', points: 3,
          solution: 'Candidates: critical points in [0,4] (x=1,3) and endpoints (x=0,4). f(0)=2, f(1)=6, f(3)=2, f(4)=64−96+36+2=6. Absolute max value is 6, attained at both x=1 and x=4.' }
      ], maxPoints: 9, note: 'Justify max/min with a sign analysis of f’, not just by plugging in.'
    }
  ],

  // ---------------------------------------------------------------- AP Statistics
  'ap-stats': [
    {
      id: 'apstats-frq-ci', topic: 'Confidence Interval', difficulty: 'AP', calculator: true,
      prompt: 'A random sample of 200 adults in a city found that 116 support a new public-transit tax.',
      parts: [
        { label: '(a)', ask: 'Construct and interpret a 95% confidence interval for the true proportion of adults who support the tax.', points: 4,
          solution: 'p̂ = 116/200 = 0.58. SE = √(0.58·0.42/200) ≈ 0.0349. 95% z* = 1.96. Interval: 0.58 ± 1.96(0.0349) = 0.58 ± 0.0684 ≈ (0.512, 0.648). Interpretation: We are 95% confident the true proportion of all adults in the city who support the tax is between about 51.2% and 64.8%.' },
        { label: '(b)', ask: 'Verify the conditions required for this interval are met.', points: 2,
          solution: 'Random: stated random sample. Independence/10%: 200 < 10% of all city adults (reasonable). Large counts: np̂ = 116 ≥ 10 and n(1−p̂) = 84 ≥ 10. All conditions met.' },
        { label: '(c)', ask: 'A council member claims a majority (more than 50%) support the tax. Does the interval support this claim? Explain.', points: 3,
          solution: 'The entire interval (0.512, 0.648) lies above 0.50, so values below a majority are not plausible at the 95% level. The interval supports the claim that a majority support the tax.' }
      ], maxPoints: 9, note: 'Name the procedure (one-sample z-interval for a proportion) and check conditions before computing.'
    },
    {
      id: 'apstats-frq-test', topic: 'Significance Test', difficulty: 'AP', calculator: true,
      prompt: 'A company claims its light bulbs last 1000 hours on average. A consumer group tests a random sample of 40 bulbs and finds a mean life of 970 hours with standard deviation 80 hours. Test at α = 0.05 whether the true mean is less than the claim.',
      parts: [
        { label: '(a)', ask: 'State the hypotheses and the name of the test.', points: 2,
          solution: 'One-sample t-test for a mean. H₀: μ = 1000 hours vs. Hₐ: μ < 1000 hours, where μ is the true mean bulb life.' },
        { label: '(b)', ask: 'Compute the test statistic and p-value.', points: 3,
          solution: 't = (x̄ − μ₀)/(s/√n) = (970 − 1000)/(80/√40) = −30/12.649 ≈ −2.372, df = 39. One-sided p-value ≈ 0.011.' },
        { label: '(c)', ask: 'State your conclusion in context.', points: 4,
          solution: 'Since p ≈ 0.011 < α = 0.05, reject H₀. There is convincing statistical evidence that the true mean lifetime of the bulbs is less than the claimed 1000 hours.' }
      ], maxPoints: 9, note: 'Check Random / Normal (n=40, CLT ok) / Independent conditions; link the p-value to α in the conclusion.'
    },
    {
      id: 'apstats-frq-regression', topic: 'Regression', difficulty: 'AP', calculator: false,
      prompt: 'A least-squares regression of final exam score (y) on hours studied (x) gives: ŷ = 52 + 4.6x, with r = 0.78.',
      parts: [
        { label: '(a)', ask: 'Interpret the slope in context.', points: 2,
          solution: 'For each additional hour studied, the predicted final exam score increases by 4.6 points, on average.' },
        { label: '(b)', ask: 'Interpret r² in context.', points: 2,
          solution: 'r² = 0.78² ≈ 0.608. About 60.8% of the variation in final exam scores is explained by the linear relationship with hours studied.' },
        { label: '(c)', ask: 'A student studied 6 hours and scored 68. Find and interpret the residual.', points: 3,
          solution: 'Predicted: ŷ = 52 + 4.6(6) = 79.6. Residual = observed − predicted = 68 − 79.6 = −11.6. The student scored 11.6 points LOWER than the model predicted.' },
        { label: '(d)', ask: 'Explain why you should not use this model to predict the score for a student who studied 40 hours.', points: 2,
          solution: 'That is far outside the range of the observed data (extrapolation); the linear relationship is not guaranteed to hold, and predicted scores could exceed 100, which is impossible.' }
      ], maxPoints: 9, note: 'Always interpret slope/r² with units and "predicted / on average" language.'
    }
  ],

  // ---------------------------------------------------------------- AP Biology
  'ap-bio': [
    {
      id: 'apbio-frq-enzyme', topic: 'Enzymes & Experimental Design', difficulty: 'AP', calculator: false,
      prompt: 'A student studies the enzyme catalase, which breaks down hydrogen peroxide (H₂O₂) into water and oxygen gas. She measures the volume of O₂ produced per minute at several temperatures and finds activity rises from 10°C to 37°C, then drops sharply above 45°C.',
      parts: [
        { label: '(a)', ask: 'Explain why enzyme activity increases from 10°C to 37°C.', points: 2,
          solution: 'Higher temperature increases the kinetic energy of molecules, so enzyme and substrate collide more frequently and with more energy, increasing the rate of successful reactions (more enzyme-substrate complexes formed per unit time).' },
        { label: '(b)', ask: 'Explain the sharp drop in activity above 45°C.', points: 2,
          solution: 'High temperature disrupts the hydrogen bonds and other interactions maintaining the enzyme’s tertiary structure, causing DENATURATION. The active site changes shape and can no longer bind substrate, so activity falls sharply.' },
        { label: '(c)', ask: 'Identify the independent and dependent variables and one variable that should be controlled.', points: 3,
          solution: 'Independent: temperature. Dependent: rate of O₂ production (volume O₂ per minute). Controlled (any one): H₂O₂ concentration, enzyme concentration, pH, volume of solution, time interval.' },
        { label: '(d)', ask: 'Predict and justify the result if the experiment were repeated at pH 2 (highly acidic) at 37°C.', points: 2,
          solution: 'Activity would be much lower or zero. Extreme pH disrupts ionic and hydrogen bonds, denaturing the enzyme (or altering active-site charge), so substrate cannot bind effectively even at the optimal temperature.' }
      ], maxPoints: 9, note: 'Use precise vocabulary: denaturation, active site, substrate, kinetic energy.'
    },
    {
      id: 'apbio-frq-genetics', topic: 'Genetics & Chi-Square', difficulty: 'AP', calculator: true,
      prompt: 'In pea plants, purple flowers (P) are dominant to white (p). A cross of two heterozygous plants (Pp × Pp) yields 145 purple and 55 white offspring (n = 200). χ² critical value at df=1, α=0.05 is 3.84.',
      parts: [
        { label: '(a)', ask: 'State the expected phenotypic ratio and the expected counts.', points: 2,
          solution: 'Pp × Pp → 3:1 purple:white. Expected: purple = (3/4)(200) = 150, white = (1/4)(200) = 50.' },
        { label: '(b)', ask: 'Calculate the chi-square statistic.', points: 3,
          solution: 'χ² = Σ (O−E)²/E = (145−150)²/150 + (55−50)²/50 = 25/150 + 25/50 = 0.1667 + 0.5 = 0.667.' },
        { label: '(c)', ask: 'State your conclusion about whether the data fit the expected 3:1 ratio.', points: 4,
          solution: 'χ² = 0.667 < critical 3.84, so we FAIL TO REJECT the null hypothesis. The deviation from a 3:1 ratio is not statistically significant — the data are consistent with the expected Mendelian 3:1 ratio (differences are attributable to chance).' }
      ], maxPoints: 9, note: 'The null hypothesis is that observed = expected (differences due to chance).'
    },
    {
      id: 'apbio-frq-cellresp', topic: 'Cellular Respiration', difficulty: 'AP', calculator: false,
      prompt: 'Cells generate ATP through glycolysis, the Krebs cycle, and oxidative phosphorylation.',
      parts: [
        { label: '(a)', ask: 'State where in the cell glycolysis and the Krebs cycle each occur.', points: 2,
          solution: 'Glycolysis: cytoplasm (cytosol). Krebs (citric acid) cycle: mitochondrial matrix.' },
        { label: '(b)', ask: 'Explain the role of oxygen as the final electron acceptor and what happens without it.', points: 3,
          solution: 'In oxidative phosphorylation, O₂ is the final electron acceptor at the end of the electron transport chain, combining with electrons and H⁺ to form water. This keeps the chain running so the proton gradient (used by ATP synthase) is maintained. Without O₂, the ETC backs up, NADH cannot be reoxidized, and the cell must rely on fermentation to regenerate NAD⁺, producing far less ATP.' },
        { label: '(c)', ask: 'A poison blocks ATP synthase. Predict the effect on the proton gradient and ATP output, and justify.', points: 4,
          solution: 'ATP output from oxidative phosphorylation drops to near zero because protons can no longer flow through ATP synthase to drive ATP formation. The proton gradient initially becomes STEEPER (protons keep being pumped but cannot return), until the buildup halts the ETC. Only the small ATP yield from glycolysis/Krebs (substrate-level phosphorylation) remains.' }
      ], maxPoints: 9, note: 'Connect structure (location) to function (energy yield).'
    }
  ],

  // ---------------------------------------------------------------- AP Chemistry
  'ap-chem': [
    {
      id: 'apchem-frq-stoich', topic: 'Stoichiometry & Gas Laws', difficulty: 'AP', calculator: true,
      prompt: 'Solid calcium carbonate decomposes on heating: CaCO₃(s) → CaO(s) + CO₂(g). A 25.0 g sample of CaCO₃ (molar mass 100.09 g/mol) is heated until it fully decomposes.',
      parts: [
        { label: '(a)', ask: 'Calculate the number of moles of CO₂ produced.', points: 3,
          solution: 'moles CaCO₃ = 25.0/100.09 = 0.2498 mol. Mole ratio CaCO₃:CO₂ = 1:1, so moles CO₂ = 0.2498 ≈ 0.250 mol.' },
        { label: '(b)', ask: 'Calculate the volume this CO₂ occupies at 1.00 atm and 25°C (298 K). R = 0.08206 L·atm/(mol·K).', points: 3,
          solution: 'V = nRT/P = (0.2498)(0.08206)(298)/1.00 = 6.11 L.' },
        { label: '(c)', ask: 'Calculate the mass of solid CaO remaining (molar mass 56.08 g/mol).', points: 3,
          solution: 'moles CaO = moles CaCO₃ = 0.2498 mol. mass = 0.2498 × 56.08 = 14.0 g. (Check: 25.0 − 14.0 = 11.0 g ≈ mass of CO₂ = 0.2498×44.01 = 11.0 g. ✓)' }
      ], maxPoints: 9, note: 'Carry units through; use the balanced equation for mole ratios.'
    },
    {
      id: 'apchem-frq-equilibrium', topic: 'Acid-Base Equilibrium', difficulty: 'AP', calculator: true,
      prompt: 'Acetic acid (CH₃COOH) is a weak acid with Ka = 1.8 × 10⁻⁵. Consider a 0.10 M solution.',
      parts: [
        { label: '(a)', ask: 'Write the Ka expression and set up an ICE table to find [H⁺].', points: 4,
          solution: 'Ka = [H⁺][CH₃COO⁻]/[CH₃COOH]. ICE: initial 0.10, change −x/+x/+x, equilibrium (0.10−x, x, x). 1.8×10⁻⁵ = x²/(0.10−x) ≈ x²/0.10 (x small). x² = 1.8×10⁻⁶, x = [H⁺] = 1.34×10⁻³ M.' },
        { label: '(b)', ask: 'Calculate the pH of the solution.', points: 2,
          solution: 'pH = −log[H⁺] = −log(1.34×10⁻³) = 2.87.' },
        { label: '(c)', ask: 'Calculate the percent ionization and comment on whether the small-x approximation was valid.', points: 3,
          solution: '% ionization = (x/0.10)×100 = (1.34×10⁻³/0.10)×100 = 1.34%. Since 1.34% < 5%, the approximation (0.10−x ≈ 0.10) was valid.' }
      ], maxPoints: 9, note: 'State the small-x (5%) approximation and verify it.'
    },
    {
      id: 'apchem-frq-thermo', topic: 'Thermochemistry', difficulty: 'AP', calculator: true,
      prompt: 'When 50.0 mL of 1.0 M HCl is mixed with 50.0 mL of 1.0 M NaOH (both at 22.0°C) in a coffee-cup calorimeter, the temperature rises to 28.8°C. Assume the solution has the density and specific heat of water (1.00 g/mL, 4.18 J/g·°C).',
      parts: [
        { label: '(a)', ask: 'Calculate the heat released by the reaction (q).', points: 3,
          solution: 'Total mass = 100.0 mL × 1.00 g/mL = 100.0 g. ΔT = 28.8 − 22.0 = 6.8°C. q = mcΔT = (100.0)(4.18)(6.8) = 2842 J ≈ 2.84 kJ released by the reaction (q_rxn = −2.84 kJ).' },
        { label: '(b)', ask: 'Calculate the enthalpy of neutralization per mole of water formed (ΔH in kJ/mol).', points: 3,
          solution: 'moles H₂O formed = moles HCl = 0.0500 L × 1.0 M = 0.050 mol. ΔH = −q_rxn/mol = −2.84 kJ / 0.050 mol = −56.8 kJ/mol.' },
        { label: '(c)', ask: 'Is the reaction endothermic or exothermic? Justify with the sign of ΔH.', points: 3,
          solution: 'Exothermic. The temperature increased (heat released to the solution) and ΔH is negative (−56.8 kJ/mol), both indicating an exothermic reaction.' }
      ], maxPoints: 9, note: 'q_solution = −q_reaction; keep sign conventions explicit.'
    }
  ],

  // ---------------------------------------------------------------- AP Physics 1
  'ap-physics1': [
    {
      id: 'apphys-frq-incline', topic: 'Forces on an Incline', difficulty: 'AP', calculator: true,
      prompt: 'A 2.0 kg block is released from rest at the top of a frictionless ramp inclined at 30° above the horizontal. The ramp is 4.0 m long. (g = 9.8 m/s².)',
      parts: [
        { label: '(a)', ask: 'Draw/describe the free-body diagram and find the acceleration of the block down the ramp.', points: 3,
          solution: 'Forces: gravity mg (down), normal force N (perpendicular to ramp). Along the incline: ma = mg sinθ, so a = g sin30° = 9.8(0.5) = 4.9 m/s² down the ramp.' },
        { label: '(b)', ask: 'Find the speed of the block at the bottom of the ramp.', points: 3,
          solution: 'Using v² = v₀² + 2a·d = 0 + 2(4.9)(4.0) = 39.2, v = 6.26 m/s. (Energy check: mgh = ½mv², h = 4 sin30 = 2.0 m, v = √(2gh) = √(39.2) = 6.26 m/s. ✓)' },
        { label: '(c)', ask: 'The ramp is now given a coefficient of kinetic friction μ = 0.20. Find the new acceleration.', points: 3,
          solution: 'N = mg cosθ, friction f = μN = μ mg cosθ (up the ramp). ma = mg sinθ − μ mg cosθ, a = g(sin30 − 0.20 cos30) = 9.8(0.5 − 0.20·0.866) = 9.8(0.5 − 0.173) = 9.8(0.327) = 3.20 m/s².' }
      ], maxPoints: 9, note: 'Resolve gravity into components along and perpendicular to the incline.'
    },
    {
      id: 'apphys-frq-momentum', topic: 'Momentum & Energy', difficulty: 'AP', calculator: true,
      prompt: 'A 0.50 kg cart moving at 4.0 m/s collides with a stationary 1.5 kg cart on a frictionless track. After the collision the two carts stick together.',
      parts: [
        { label: '(a)', ask: 'Find the velocity of the combined carts after the collision.', points: 3,
          solution: 'Conservation of momentum: m₁v₁ = (m₁+m₂)v′. (0.50)(4.0) = (2.0)v′, v′ = 2.0/2.0 = 1.0 m/s.' },
        { label: '(b)', ask: 'Determine whether kinetic energy is conserved. Show your work.', points: 4,
          solution: 'KE before = ½(0.50)(4.0)² = 4.0 J. KE after = ½(2.0)(1.0)² = 1.0 J. KE is NOT conserved (4.0 J → 1.0 J); 3.0 J is lost to heat/deformation. This is an inelastic (perfectly inelastic) collision.' },
        { label: '(c)', ask: 'Explain why momentum is conserved but kinetic energy is not.', points: 2,
          solution: 'Momentum is conserved because no external horizontal forces act (frictionless), so total momentum is constant. Kinetic energy is not conserved because the collision is inelastic — some KE is converted to internal energy (heat, sound, deformation) when the carts stick.' }
      ], maxPoints: 9, note: 'Momentum is a vector and always conserved with no external force; KE is only conserved in elastic collisions.'
    },
    {
      id: 'apphys-frq-circular', topic: 'Circular Motion', difficulty: 'AP', calculator: true,
      prompt: 'A 0.30 kg ball is attached to a string and whirled in a horizontal circle of radius 0.80 m at a constant speed, completing 2.0 revolutions per second.',
      parts: [
        { label: '(a)', ask: 'Find the speed of the ball.', points: 3,
          solution: 'Period T = 1/2.0 = 0.50 s. Speed v = 2πr/T = 2π(0.80)/0.50 = 10.05 m/s ≈ 10 m/s.' },
        { label: '(b)', ask: 'Find the centripetal acceleration and the tension in the string (ignore gravity for the horizontal circle idealization).', points: 4,
          solution: 'a_c = v²/r = (10.05)²/0.80 = 126 m/s². Tension provides the centripetal force: T = m a_c = 0.30(126) = 37.9 N ≈ 38 N.' },
        { label: '(c)', ask: 'If the string can withstand a maximum tension of 60 N, what is the maximum speed before it breaks?', points: 2,
          solution: 'T_max = m v_max²/r ⇒ v_max = √(T_max·r/m) = √(60·0.80/0.30) = √160 = 12.6 m/s.' }
      ], maxPoints: 9, note: 'Centripetal force is the NET inward force, not a new separate force.'
    }
  ],

  // ---------------------------------------------------------------- AP Environmental Science
  'ap-envsci': [
    {
      id: 'apenv-frq-population', topic: 'Population & Data', difficulty: 'AP', calculator: true,
      prompt: 'A town of 50,000 people has a birth rate of 18 per 1000 per year and a death rate of 8 per 1000 per year. Net migration is +2 per 1000 per year.',
      parts: [
        { label: '(a)', ask: 'Calculate the annual percent growth rate of the population.', points: 3,
          solution: 'Growth rate = (births − deaths + net migration)/1000 = (18 − 8 + 2)/1000 = 12/1000 = 0.012 = 1.2% per year.' },
        { label: '(b)', ask: 'Using the rule of 70, estimate the doubling time of the population.', points: 2,
          solution: 'Doubling time ≈ 70 / (percent growth rate) = 70 / 1.2 ≈ 58.3 years.' },
        { label: '(c)', ask: 'Calculate the number of people added in the first year.', points: 2,
          solution: 'People added = 0.012 × 50,000 = 600 people in the first year.' },
        { label: '(d)', ask: 'Describe one environmental consequence of this growth and one sustainable mitigation strategy.', points: 2,
          solution: 'Consequence (any valid): increased demand for water/energy, more waste, habitat loss from development, higher emissions. Mitigation (any valid): investing in public transit, water-conservation/efficiency programs, zoning to protect green space, renewable energy adoption.' }
      ], maxPoints: 9, note: 'Show the formula before plugging numbers; include units.'
    },
    {
      id: 'apenv-frq-energy', topic: 'Energy & Pollution', difficulty: 'AP', calculator: true,
      prompt: 'A coal power plant produces 500 megawatts (MW) of electricity and operates at 35% efficiency. Burning 1 kg of coal releases about 24 MJ of energy.',
      parts: [
        { label: '(a)', ask: 'Explain what "35% efficiency" means for this plant.', points: 2,
          solution: 'Only 35% of the chemical energy released by burning coal is converted into useful electrical energy; the other 65% is lost, mostly as waste heat (thermal pollution) to the environment.' },
        { label: '(b)', ask: 'Calculate the total energy input (in MW of thermal power) required to produce 500 MW of electricity.', points: 3,
          solution: 'Input = output/efficiency = 500 MW / 0.35 = 1429 MW of thermal power.' },
        { label: '(c)', ask: 'Identify two air pollutants released by burning coal and one environmental effect of each.', points: 4,
          solution: 'Any two: CO₂ → enhanced greenhouse effect / climate change; SO₂ → acid rain (and respiratory harm); NOₓ → acid rain / smog / ground-level ozone; particulate matter (PM) → respiratory disease / reduced visibility; mercury → bioaccumulation in aquatic food chains.' }
      ], maxPoints: 9, note: 'Efficiency = useful output / total input.'
    }
  ],

  // ---------------------------------------------------------------- AP English Language (essay; rubric rows)
  'ap-eng-lang': [
    {
      id: 'apenglang-frq-rhetorical', topic: 'Rhetorical Analysis', difficulty: 'AP', calculator: false, essay: true,
      prompt: `RHETORICAL ANALYSIS · suggested time ~40 min.

On March 23, 1775, Patrick Henry rose before the Virginia Convention to urge the American colonies to arm for war with Britain. Read the excerpt from his speech below. Then write a well-organized essay that analyzes the rhetorical choices Henry makes to move his audience to act.

——— PASSAGE ———
"They tell us, sir, that we are weak — unable to cope with so formidable an adversary. But when shall we be stronger? Will it be the next week, or the next year? ... Shall we gather strength by irresolution and inaction? ...

Sir, we are not weak, if we make a proper use of the means which the God of nature hath placed in our power. Three millions of people, armed in the holy cause of liberty, and in such a country as that which we possess, are invincible by any force which our enemy can send against us. ...

Gentlemen may cry, Peace, Peace — but there is no peace. The war is actually begun! ... Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! I know not what course others may take; but as for me, give me liberty, or give me death!"
——— END PASSAGE ———

Work the essay on paper or in the boxes below, then score yourself honestly against the 6-point AP rubric. (Public-domain practice passage — AP-style skill practice, not an official College Board exam.)`,
      parts: [
        { label: 'Thesis (0–1)', ask: 'Do you have a defensible thesis that analyzes the writer’s rhetorical choices (not just restating the prompt)?', points: 1,
          solution: 'Full point: a clear, defensible thesis identifying the writer’s purpose AND how rhetorical choices serve it. No point: a summary, a restatement of the prompt, or only description with no claim.' },
        { label: 'Evidence & Commentary (0–4)', ask: 'Score your body: specific evidence + commentary explaining HOW each choice functions rhetorically.', points: 4,
          solution: '4 = specific evidence throughout AND consistent commentary explaining how the choices build the argument/appeal to audience. 3 = evidence + some explanation, uneven. 2 = mostly summary with little analysis. 1 = general references, minimal support. Reward line-of-reasoning and analysis of effect on audience, not device-spotting.' },
        { label: 'Sophistication (0–1)', ask: 'Does the essay show sophistication — nuance, a broader significance, or a particularly effective style?', points: 1,
          solution: 'Full point (rare): situates the argument in a broader context, addresses complexity/tension, OR employs a consistently vivid, controlled style. Not for a single fancy sentence — sophistication must run through the essay.' }
      ], maxPoints: 6, note: 'AP Lang uses a 6-point rubric: 1 thesis + 4 evidence/commentary + 1 sophistication. Analyze EFFECT, don’t just name devices.'
    },
    {
      id: 'apenglang-frq-argument', topic: 'Argument Essay', difficulty: 'AP', calculator: false, essay: true,
      prompt: 'ARGUMENT. "The most valuable education is one that prepares a person to think, not one that prepares them for a job." Write an essay that argues your position on this claim, using specific evidence from your reading, studies, or experience. Then self-score with the rubric.',
      parts: [
        { label: 'Thesis (0–1)', ask: 'Is your thesis a defensible position that responds to the prompt?', points: 1,
          solution: 'Full point: a clear position (agree, disagree, or qualify) that takes a defensible stance. No point: no position, or only restating the prompt.' },
        { label: 'Evidence & Commentary (0–4)', ask: 'Score the development of your argument with specific evidence and reasoning.', points: 4,
          solution: '4 = consistent specific evidence AND commentary that explains how it supports a clear line of reasoning; may address complexity. 3 = adequate evidence with some reasoning. 2 = mostly general or unexplained evidence. 1 = minimal/irrelevant support. Qualifying the claim (both/and) done well earns high marks.' },
        { label: 'Sophistication (0–1)', ask: 'Does the essay demonstrate sophistication of thought or a compelling command of style?', points: 1,
          solution: 'Full point: engages the complexity of the issue (e.g., tension between thinking and employability), situates it in a broader context, or sustains a vivid, persuasive style throughout.' }
      ], maxPoints: 6, note: 'A strong essay often QUALIFIES the claim rather than fully agreeing/disagreeing — that complexity supports the sophistication point.'
    },
    {
      id: 'apenglang-frq-synthesis', topic: 'Synthesis (Source-Based Argument)', difficulty: 'AP', calculator: false, essay: true,
      prompt: `SYNTHESIS · suggested time ~15 min reading + 40 min writing.

Many U.S. high schools begin the day before 8:00 a.m. Some communities have proposed starting later for teenagers. Read the six sources below, then write an essay that develops your own position on whether high schools should start the school day later, SYNTHESIZING material from AT LEAST THREE of the sources for support. Cite them as Source A, Source B, etc. Do not merely summarize the sources — use them to build your argument.

——— SOURCE PACKET (written for this practice set) ———

Source A (Sleep science): During puberty the brain releases melatonin later at night, so most teenagers cannot easily fall asleep before about 11 p.m. Because adolescents need roughly 8–10 hours of sleep, a 7:30 a.m. start leaves the typical teen chronically short on rest — no matter how early they are told to go to bed.

Source B (Superintendent's memo): After our district moved high-school start times from 7:25 to 8:35 a.m., we tracked two years of data. First-period tardies fell sharply and counselors reported far fewer students asleep in class. The change meant rerouting buses and trimming one passing period, but families adjusted within a semester.

Source C (Data — attendance & grades): A summary table for three high schools that delayed their start shows, in the following year: average daily attendance rising from about 92% to 95%; first-period D and F grades falling from 14% to 9%; and fewer early-morning crashes involving teen drivers. A nearby school that kept its early start showed no comparable gains.

Source D (Transportation director): Our buses run three tiered routes on one set of drivers. A later high-school start means either elementary students start earlier — six-year-olds at dark bus stops — or the district buys and staffs more buses. After-school jobs, athletics, and sibling childcare all shift too. The science may be sound, but the logistics are not free.

Source E (Student op-ed): I am not lazy. I am up at 6 a.m., on the bus in the dark, and asked to analyze poetry before my brain is awake. By the time I feel alert, the day is nearly over. A later start would not buy me more screen time; it would give me the sleep my body is actually asking for.

Source F (Pediatric association statement): We recommend that middle and high schools begin no earlier than 8:30 a.m. Insufficient adolescent sleep is associated with weaker academic performance, higher rates of anxiety and depression, and more motor-vehicle crashes. Aligning school hours with adolescent sleep biology is a low-cost public-health measure.
——— END SOURCES ———

Write your essay, then self-score with the rubric. (Original practice sources — AP-style skill practice, not an official College Board exam.)`,
      parts: [
        { label: 'Thesis (0–1)', ask: 'Do you state a defensible position on whether schools should start later (not just restating the prompt)?', points: 1,
          solution: 'Full point: a clear, defensible thesis taking a position (yes, no, or a qualified stance). No point: no position, or only announcing the topic.' },
        { label: 'Evidence & Commentary (0–4)', ask: 'Score your body: do you integrate at least THREE sources as evidence, with commentary that builds your own line of reasoning?', points: 4,
          solution: '4 = consistently uses and comments on ≥3 sources to develop a clear line of reasoning (not a source-by-source summary). 3 = uses sources with some explanation, uneven. 2 = mostly summarizes sources with little argument of your own. 1 = minimal support or fewer than the required sources. Note: citing fewer than three sources caps this row at 2. Strong essays use a counter-source (e.g., Source D) and answer it.' },
        { label: 'Sophistication (0–1)', ask: 'Does the essay show sophistication — addressing tension in the issue, broader significance, or a controlled persuasive style?', points: 1,
          solution: 'Full point (rare): engages the complexity (e.g., weighs the logistics in Source D against the health case in A/F), situates the question in a broader context, or sustains a vivid, controlled style throughout. Not for one clever sentence.' }
      ], maxPoints: 6, note: 'AP Lang Synthesis uses the 6-point rubric. Cite at least THREE sources by letter and SYNTHESIZE them into YOUR argument — do not summarize source by source.'
    }
  ],

  // ---------------------------------------------------------------- AP English Literature (essay; rubric rows)
  'ap-eng-lit': [
    {
      id: 'apenglit-frq-poetry', topic: 'Poetry Analysis', difficulty: 'AP', calculator: false, essay: true,
      prompt: `POETRY ANALYSIS · suggested time ~40 min.

Read the following poem carefully. Then write a well-organized essay analyzing how Shelley uses literary techniques — imagery, structure, diction, irony, tone — to convey a complex attitude toward power and time.

——— POEM ———
"Ozymandias" (1818) — Percy Bysshe Shelley

I met a traveller from an antique land,
Who said—"Two vast and trunkless legs of stone
Stand in the desert. ... Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away."
——— END POEM ———

Write your essay, then self-score with the AP Lit rubric. (Public-domain poem — AP-style skill practice, not an official College Board exam.)`,
      parts: [
        { label: 'Thesis (0–1)', ask: 'Do you have a defensible thesis about how the poem creates meaning?', points: 1,
          solution: 'Full point: a defensible interpretive claim about meaning/attitude AND the means the poet uses. No point: summary of the poem or restatement of the prompt.' },
        { label: 'Evidence & Commentary (0–4)', ask: 'Score evidence (specific textual references) and commentary linking technique to meaning.', points: 4,
          solution: '4 = specific, well-chosen textual evidence AND commentary that consistently explains how techniques create meaning, developing a line of reasoning. 3 = evidence + some explanation. 2 = summary-heavy, thin analysis. 1 = vague references. Reward analysis of COMPLEXITY (e.g., a shift in tone) over device lists.' },
        { label: 'Sophistication (0–1)', ask: 'Does the essay demonstrate sophistication of thought (nuance, tension, complexity)?', points: 1,
          solution: 'Full point: explores complexity/ambiguity, illuminates a broader interpretation, or sustains a persuasive, controlled voice. Must be earned across the essay.' }
      ], maxPoints: 6, note: 'AP Lit rubric: 1 thesis + 4 evidence/commentary + 1 sophistication. Tie every technique to MEANING.'
    },
    {
      id: 'apenglit-frq-prose', topic: 'Prose Fiction Analysis', difficulty: 'AP', calculator: false, essay: true,
      prompt: `PROSE FICTION ANALYSIS · suggested time ~40 min.

The passage below is from Kate Chopin's short story "The Story of an Hour" (1894). Louise Mallard, who has a heart condition, has just been told that her husband was killed in a train accident. Read the passage carefully. Then write a well-organized essay analyzing how Chopin uses characterization and one other technique (such as setting, irony, or point of view) to develop a complex theme.

——— PASSAGE ———
She did not hear the story as many women have heard the same, with a paralyzed inability to accept its significance. She wept at once, with sudden, wild abandonment, in her sister's arms. When the storm of grief had spent itself she went away to her room alone. She would have no one follow her.

There stood, facing the open window, a comfortable, roomy armchair. Into this she sank, pressed down by a physical exhaustion that haunted her body and seemed to reach into her soul.

She was young, with a fair, calm face, whose lines bespoke repression and even a certain strength. But now there was a dull stare in her eyes. ... She was beginning to recognize this thing that was approaching to possess her, and she was striving to beat it back with her will.

When she abandoned herself, a little whispered word escaped her slightly parted lips. She said it over and over under her breath: "free, free, free!" ... She saw beyond that bitter moment a long procession of years to come that would belong to her absolutely.
——— END PASSAGE ———

Write your essay, then self-score with the rubric. (Public-domain passage — AP-style skill practice, not an official College Board exam.)`,
      parts: [
        { label: 'Thesis (0–1)', ask: 'Is there a defensible thesis connecting technique to theme?', points: 1,
          solution: 'Full point: a defensible claim about how characterization (and another technique) develops a theme. No point: plot summary or prompt restatement.' },
        { label: 'Evidence & Commentary (0–4)', ask: 'Score specific evidence and analysis of how it develops the theme.', points: 4,
          solution: '4 = specific evidence from the text AND consistent commentary building a clear line of reasoning about theme. 3 = adequate but uneven. 2 = summary with limited analysis. 1 = generalized references. Avoid plot retelling; analyze authorial choices.' },
        { label: 'Sophistication (0–1)', ask: 'Does the essay show sophistication (complexity, broader significance, style)?', points: 1,
          solution: 'Full point: engages tension/complexity in the work, connects to a broader meaning, or shows a vivid, controlled style sustained throughout.' }
      ], maxPoints: 6, note: 'Focus on the AUTHOR’S choices and their effect, not on retelling the story.'
    }
  ],

  // ---------------------------------------------------------------- AP Spanish Language (writing; rubric rows)
  'ap-spanish': [
    {
      id: 'apspan-frq-email', topic: 'Interpersonal Writing (Email Reply)', difficulty: 'AP', calculator: false, essay: true,
      prompt: 'CORREO ELECTRÓNICO. Has recibido un correo de la directora de un programa de intercambio en España pidiéndote información sobre tus intereses y una pregunta sobre el alojamiento. Escribe una respuesta formal (mínimo 150 palabras): saluda apropiadamente, responde a todas las preguntas, haz una pregunta de seguimiento y despídete formalmente. Luego, evalúate con la rúbrica.',
      parts: [
        { label: 'Task completion (0–2)', ask: '¿Respondiste a TODAS las partes (saludo, preguntas, tu pregunta, despedida) de forma apropiada y formal?', points: 2,
          solution: '2 = responde plenamente a todas las partes con un registro formal apropiado (usted), incluye una pregunta relevante. 1 = responde parcialmente o mezcla registros. 0 = no cumple la tarea. Debe usar saludo/despedida formales (Estimada directora / Atentamente).' },
        { label: 'Language use (0–2)', ask: 'Gramática, vocabulario y variedad de estructuras.', points: 2,
          solution: '2 = variedad de estructuras y vocabulario preciso; errores no impiden la comunicación. 1 = estructuras básicas, errores frecuentes pero comprensible. 0 = errores que impiden la comprensión. Reward correct subjunctive/tense use and connectors (sin embargo, por lo tanto).' },
        { label: 'Register & conventions (0–2)', ask: 'Registro formal consistente y convenciones del correo (ortografía, cortesía).', points: 2,
          solution: '2 = registro formal constante (usted), cortesía, ortografía/acentos correctos. 1 = registro inconsistente o varios errores de convención. 0 = registro inapropiado (tú a una autoridad) o convenciones muy deficientes.' }
      ], maxPoints: 6, note: 'Usa el registro formal (usted). Incluye conectores y al menos una estructura compleja (subjuntivo o condicional).'
    },
    {
      id: 'apspan-frq-essay', topic: 'Presentational Writing (Persuasive Essay)', difficulty: 'AP', calculator: false, essay: true,
      prompt: 'ENSAYO PERSUASIVO. Tema: ¿Deben las escuelas requerir el aprendizaje de una segunda lengua? Escribe un ensayo persuasivo (mínimo 200 palabras) con una tesis clara, argumentos con ejemplos, y una conclusión. Presenta y refuta un punto de vista opuesto. Evalúate con la rúbrica.',
      parts: [
        { label: 'Thesis & argument (0–2)', ask: '¿Tienes una tesis clara y desarrollas argumentos que la apoyan, incluyendo una refutación?', points: 2,
          solution: '2 = tesis clara, argumentos bien desarrollados con ejemplos, y presenta/refuta la opinión contraria. 1 = tesis presente pero desarrollo limitado o sin refutación. 0 = sin tesis o argumentos.' },
        { label: 'Organization & cohesion (0–2)', ask: 'Organización (introducción–cuerpo–conclusión) y uso de conectores.', points: 2,
          solution: '2 = estructura clara con introducción, cuerpo y conclusión, y transiciones eficaces (en primer lugar, por otro lado, en conclusión). 1 = organización básica, transiciones limitadas. 0 = desorganizado.' },
        { label: 'Language use (0–2)', ask: 'Variedad y precisión gramatical y de vocabulario.', points: 2,
          solution: '2 = variedad de tiempos/estructuras (incluye subjuntivo), vocabulario preciso; errores menores. 1 = estructuras básicas con errores frecuentes pero comprensible. 0 = errores que impiden la comunicación.' }
      ], maxPoints: 6, note: 'Incorpora el subjuntivo (Es importante que…), conectores y vocabulario preciso. Refuta la postura contraria.'
    }
  ]
};

const FRQ_META = {
  // exam-style score bands used by the simulator per exam family (approximate, practice estimate)
};

function listFrqs(trackId) {
  const b = FRQ_BANKS[trackId] || [];
  return b.map(f => ({ id: f.id, topic: f.topic, difficulty: f.difficulty, maxPoints: f.maxPoints, essay: !!f.essay, calculator: f.calculator == null ? null : !!f.calculator, parts: f.parts.length }));
}
function getFrq(trackId, frqId) {
  const b = FRQ_BANKS[trackId] || [];
  return b.find(f => f.id === frqId) || null;
}
function frqCount(trackId) { return (FRQ_BANKS[trackId] || []).length; }
function hasFrqs(trackId) { return frqCount(trackId) > 0; }

module.exports = { FRQ_BANKS, listFrqs, getFrq, frqCount, hasFrqs };
