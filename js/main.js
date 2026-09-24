(function () {
  "use strict";

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Contact form → mailto with required subject */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (document.getElementById("name") || {}).value || "";
      var email = (document.getElementById("email") || {}).value || "";
      var message = (document.getElementById("message") || {}).value || "";
      var body =
        "Name: " + name.trim() +
        "\nEmail: " + email.trim() +
        "\n\n" + message.trim();
      var mailto =
        "mailto:joshuaofisrael@gmail.com" +
        "?subject=" + encodeURIComponent("[Contact: simplemacroguide]") +
        "&body=" + encodeURIComponent(body);
      window.location.href = mailto;
    });
  }

  /* Inflation adjuster calculator (offline, vanilla JS) */
  var calcBtn = document.getElementById("calc-inflate");
  if (calcBtn) {
    var amountEl = document.getElementById("amount");
    var fromEl = document.getElementById("from-year");
    var toEl = document.getElementById("to-year");
    var rateEl = document.getElementById("avg-rate");
    var resultEl = document.getElementById("calc-result");
    var amountOut = document.getElementById("result-amount");
    var detailOut = document.getElementById("result-detail");
    var errorEl = document.getElementById("calc-error");
    var resetBtn = document.getElementById("calc-reset");

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.classList.add("visible");
      resultEl.classList.remove("visible");
    }
    function clearError() {
      errorEl.classList.remove("visible");
      errorEl.textContent = "";
    }

    function formatMoney(n) {
      return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    calcBtn.addEventListener("click", function () {
      clearError();
      var amount = parseFloat(amountEl.value);
      var fromYear = parseInt(fromEl.value, 10);
      var toYear = parseInt(toEl.value, 10);
      var rate = parseFloat(rateEl.value);

      if (!isFinite(amount) || amount < 0) {
        showError("Enter an amount of zero or greater.");
        return;
      }
      if (!isFinite(fromYear) || !isFinite(toYear) || fromYear < 1800 || toYear < 1800) {
        showError("Enter valid years (1800 or later).");
        return;
      }
      if (toYear === fromYear) {
        showError("Choose different start and end years.");
        return;
      }
      if (!isFinite(rate) || rate < -50 || rate > 100) {
        showError("Enter a plausible average annual inflation rate (for example 2 to 4).");
        return;
      }

      var years = toYear - fromYear;
      var factor = Math.pow(1 + rate / 100, years);
      var adjusted = amount * factor;
      var direction = years > 0 ? "forward" : "backward";

      amountOut.textContent = formatMoney(adjusted);
      detailOut.textContent =
        formatMoney(amount) + " in " + fromYear +
        " ≈ " + formatMoney(adjusted) + " in " + toYear +
        " using an assumed " + rate + "% average annual inflation rate (" +
        Math.abs(years) + " year" + (Math.abs(years) === 1 ? "" : "s") +
        ", " + direction + "). This is an educational estimate only.";
      resultEl.classList.add("visible");
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        amountEl.value = "100";
        fromEl.value = "2000";
        toEl.value = "2024";
        rateEl.value = "2.5";
        clearError();
        resultEl.classList.remove("visible");
      });
    }
  }

  /* Real interest rate calculator */
  var realCalcBtn = document.getElementById("calc-real");
  if (realCalcBtn) {
    var nominalEl = document.getElementById("nominal-rate");
    var inflationEl = document.getElementById("inflation-rate");
    var realResultEl = document.getElementById("calc-real-result");
    var approxOut = document.getElementById("result-approx");
    var exactOut = document.getElementById("result-exact");
    var realDetailOut = document.getElementById("result-real-detail");
    var realErrorEl = document.getElementById("calc-real-error");
    var realResetBtn = document.getElementById("calc-real-reset");

    function showRealError(msg) {
      realErrorEl.textContent = msg;
      realErrorEl.classList.add("visible");
      realResultEl.classList.remove("visible");
    }
    function clearRealError() {
      realErrorEl.classList.remove("visible");
      realErrorEl.textContent = "";
    }
    function formatRatePct(decimalRate) {
      return (decimalRate * 100).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + "%";
    }

    realCalcBtn.addEventListener("click", function () {
      clearRealError();
      var nominalPct = parseFloat(nominalEl.value);
      var inflationPct = parseFloat(inflationEl.value);

      if (!isFinite(nominalPct) || nominalPct < -50 || nominalPct > 200) {
        showRealError("Enter a plausible nominal interest rate, for example 0 to 10.");
        return;
      }
      if (!isFinite(inflationPct) || inflationPct <= -100 || inflationPct > 200) {
        showRealError("Enter a plausible inflation rate above minus 100 percent. The precise formula is undefined at minus 100 percent.");
        return;
      }

      var n = nominalPct / 100;
      var i = inflationPct / 100;
      var approx = n - i;
      var exact = (1 + n) / (1 + i) - 1;

      approxOut.textContent = formatRatePct(approx);
      exactOut.textContent = formatRatePct(exact);
      realDetailOut.textContent =
        "Approximate real rate " + formatRatePct(approx) +
        " using nominal minus inflation. More precise real rate " +
        formatRatePct(exact) +
        " using the multiplicative form. Educational estimate only. Rates are your inputs, not live official series.";
      realResultEl.classList.add("visible");
    });

    if (realResetBtn) {
      realResetBtn.addEventListener("click", function () {
        nominalEl.value = "5";
        inflationEl.value = "2";
        clearRealError();
        realResultEl.classList.remove("visible");
      });
    }
  }

  /* Taylor rule calculator (classic educational 1993 form) */
  var taylorCalcBtn = document.getElementById("calc-taylor");
  if (taylorCalcBtn) {
    var rStarEl = document.getElementById("taylor-rstar");
    var taylorInflEl = document.getElementById("taylor-inflation");
    var targetEl = document.getElementById("taylor-target");
    var outputGapEl = document.getElementById("taylor-output-gap");
    var inflCoeffEl = document.getElementById("taylor-infl-coeff");
    var outputCoeffEl = document.getElementById("taylor-output-coeff");
    var actualEl = document.getElementById("taylor-actual");
    var taylorResultEl = document.getElementById("calc-taylor-result");
    var suggestedOut = document.getElementById("result-taylor-suggested");
    var neutralOut = document.getElementById("result-taylor-neutral");
    var inflGapOut = document.getElementById("result-taylor-infl-gap");
    var inflGapDetail = document.getElementById("result-taylor-infl-gap-detail");
    var outputGapOut = document.getElementById("result-taylor-output-gap");
    var outputGapDetail = document.getElementById("result-taylor-output-gap-detail");
    var realOut = document.getElementById("result-taylor-real");
    var actualBlock = document.getElementById("result-taylor-actual-block");
    var actualGapOut = document.getElementById("result-taylor-actual-gap");
    var actualDetail = document.getElementById("result-taylor-actual-detail");
    var taylorSummary = document.getElementById("result-taylor-summary");
    var taylorErrorEl = document.getElementById("calc-taylor-error");
    var taylorResetBtn = document.getElementById("calc-taylor-reset");

    function showTaylorError(msg) {
      taylorErrorEl.textContent = msg;
      taylorErrorEl.classList.add("visible");
      taylorResultEl.classList.remove("visible");
    }
    function clearTaylorError() {
      taylorErrorEl.classList.remove("visible");
      taylorErrorEl.textContent = "";
    }
    function formatTaylorPct(pctPoints) {
      return pctPoints.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + "%";
    }
    function parseOptionalActual(raw) {
      var trimmed = (raw || "").toString().trim();
      if (trimmed === "") {
        return { present: false, value: null };
      }
      var n = parseFloat(trimmed);
      if (!isFinite(n)) {
        return { present: true, value: NaN };
      }
      return { present: true, value: n };
    }

    taylorCalcBtn.addEventListener("click", function () {
      clearTaylorError();
      var rStar = parseFloat(rStarEl.value);
      var inflation = parseFloat(taylorInflEl.value);
      var target = parseFloat(targetEl.value);
      var outputGap = parseFloat(outputGapEl.value);
      var inflCoeff = parseFloat(inflCoeffEl.value);
      var outputCoeff = parseFloat(outputCoeffEl.value);
      var actual = parseOptionalActual(actualEl.value);

      if (!isFinite(rStar) || rStar < -20 || rStar > 20) {
        showTaylorError("Enter a plausible equilibrium real rate, for example 0 to 4.");
        return;
      }
      if (!isFinite(inflation) || inflation < -50 || inflation > 200) {
        showTaylorError("Enter a plausible inflation rate, for example 0 to 10.");
        return;
      }
      if (!isFinite(target) || target < -10 || target > 50) {
        showTaylorError("Enter a plausible inflation target, for example 2.");
        return;
      }
      if (!isFinite(outputGap) || outputGap < -50 || outputGap > 50) {
        showTaylorError("Enter a plausible output gap as a percent of potential, for example -2 to 2.");
        return;
      }
      if (!isFinite(inflCoeff) || inflCoeff < -5 || inflCoeff > 5) {
        showTaylorError("Enter a plausible inflation gap coefficient, for example 0.5.");
        return;
      }
      if (!isFinite(outputCoeff) || outputCoeff < -5 || outputCoeff > 5) {
        showTaylorError("Enter a plausible output gap coefficient, for example 0.5.");
        return;
      }
      if (actual.present && !isFinite(actual.value)) {
        showTaylorError("Enter a plausible actual policy rate, or leave that box blank.");
        return;
      }
      if (actual.present && (actual.value < -50 || actual.value > 200)) {
        showTaylorError("Enter a plausible actual policy rate, for example 0 to 10, or leave that box blank.");
        return;
      }

      var inflGap = inflation - target;
      var inflContrib = inflCoeff * inflGap;
      var outputContrib = outputCoeff * outputGap;
      var neutral = rStar + inflation;
      var suggested = neutral + inflContrib + outputContrib;
      var impliedReal = suggested - inflation;

      suggestedOut.textContent = formatTaylorPct(suggested);
      neutralOut.textContent = formatTaylorPct(neutral);
      inflGapOut.textContent = formatTaylorPct(inflContrib);
      inflGapDetail.textContent =
        inflCoeff.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }) +
        " × (" + formatTaylorPct(inflation) + " minus " + formatTaylorPct(target) +
        "). Inflation gap is " + formatTaylorPct(inflGap) + ".";
      outputGapOut.textContent = formatTaylorPct(outputContrib);
      outputGapDetail.textContent =
        outputCoeff.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }) +
        " × " + formatTaylorPct(outputGap) + " output gap.";
      realOut.textContent = formatTaylorPct(impliedReal);

      if (actual.present) {
        var stanceGap = suggested - actual.value;
        actualGapOut.textContent = formatTaylorPct(stanceGap);
        actualDetail.textContent =
          "Suggested " + formatTaylorPct(suggested) +
          " minus actual " + formatTaylorPct(actual.value) +
          ". A positive number means the rule sits above the rate you typed. Educational comparison only.";
        actualBlock.hidden = false;
      } else {
        actualBlock.hidden = true;
        actualGapOut.textContent = "";
        actualDetail.textContent = "";
      }

      taylorSummary.textContent =
        "Suggested nominal policy rate " + formatTaylorPct(suggested) +
        " from neutral " + formatTaylorPct(neutral) +
        " plus inflation gap contribution " + formatTaylorPct(inflContrib) +
        " plus output gap contribution " + formatTaylorPct(outputContrib) +
        ". Approximate implied real suggestion " + formatTaylorPct(impliedReal) +
        " by subtraction. Educational estimate only. Inputs are yours, not live official series.";
      taylorResultEl.classList.add("visible");
    });

    if (taylorResetBtn) {
      taylorResetBtn.addEventListener("click", function () {
        rStarEl.value = "2";
        taylorInflEl.value = "2";
        targetEl.value = "2";
        outputGapEl.value = "0";
        inflCoeffEl.value = "0.5";
        outputCoeffEl.value = "0.5";
        actualEl.value = "";
        actualBlock.hidden = true;
        clearTaylorError();
        taylorResultEl.classList.remove("visible");
      });
    }
  }

  /* Okun's law calculator (classroom difference form) */
  var okunCalcBtn = document.getElementById("calc-okun");
  if (okunCalcBtn) {
    var okunCoeffEl = document.getElementById("okun-coeff");
    var okunDuEl = document.getElementById("okun-du");
    var okunGapEl = document.getElementById("okun-gap");
    var okunUnemploymentFields = document.getElementById("okun-unemployment-fields");
    var okunGrowthFields = document.getElementById("okun-growth-fields");
    var okunModeUnemploymentBtn = document.getElementById("okun-mode-unemployment");
    var okunModeGrowthBtn = document.getElementById("okun-mode-growth");
    var okunResultEl = document.getElementById("calc-okun-result");
    var okunPrimaryLabel = document.getElementById("okun-primary-label");
    var okunPrimaryAmount = document.getElementById("okun-primary-amount");
    var okunPrimaryDetail = document.getElementById("okun-primary-detail");
    var okunArithmetic = document.getElementById("okun-arithmetic");
    var okunWords = document.getElementById("okun-words");
    var okunBeta = document.getElementById("okun-beta");
    var okunSummary = document.getElementById("okun-summary");
    var okunErrorEl = document.getElementById("calc-okun-error");
    var okunResetBtn = document.getElementById("calc-okun-reset");
    var okunMode = "unemployment";

    function showOkunError(msg) {
      okunErrorEl.textContent = msg;
      okunErrorEl.classList.add("visible");
      okunResultEl.classList.remove("visible");
    }
    function clearOkunError() {
      okunErrorEl.classList.remove("visible");
      okunErrorEl.textContent = "";
    }
    function formatOkunAbs(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatOkunSigned(n) {
      var abs = formatOkunAbs(n);
      if (n < -0.0000001) return "\u2212" + abs;
      if (n > 0.0000001) return "+" + abs;
      return "0.00";
    }
    function wordsForGap(gap) {
      var abs = formatOkunAbs(gap);
      if (gap < -0.005) {
        return "Real GDP growth sits " + abs + " percentage points below trend.";
      }
      if (gap > 0.005) {
        return "Real GDP growth sits " + abs + " percentage points above trend.";
      }
      return "Real GDP growth matches trend.";
    }
    function wordsForDu(du) {
      var abs = formatOkunAbs(du);
      if (du > 0.005) {
        return "The unemployment rate rises by " + abs + " percentage points.";
      }
      if (du < -0.005) {
        return "The unemployment rate falls by " + abs + " percentage points.";
      }
      return "The unemployment rate does not change.";
    }
    function signedWords(n) {
      var abs = formatOkunAbs(n);
      if (n < -0.0000001) return "minus " + abs;
      if (n > 0.0000001) return abs;
      return "0.00";
    }
    function hideOkunResult() {
      okunResultEl.classList.remove("visible");
      clearOkunError();
    }
    function setOkunMode(mode) {
      okunMode = mode;
      var fromUnemployment = mode === "unemployment";
      okunUnemploymentFields.hidden = !fromUnemployment;
      okunGrowthFields.hidden = fromUnemployment;
      okunModeUnemploymentBtn.className = fromUnemployment ? "btn" : "btn btn-secondary";
      okunModeGrowthBtn.className = fromUnemployment ? "btn btn-secondary" : "btn";
      okunModeUnemploymentBtn.setAttribute("aria-pressed", fromUnemployment ? "true" : "false");
      okunModeGrowthBtn.setAttribute("aria-pressed", fromUnemployment ? "false" : "true");
      hideOkunResult();
    }

    okunModeUnemploymentBtn.addEventListener("click", function () {
      setOkunMode("unemployment");
    });
    okunModeGrowthBtn.addEventListener("click", function () {
      setOkunMode("growth");
    });

    okunCalcBtn.addEventListener("click", function () {
      clearOkunError();
      var coeff = parseFloat(okunCoeffEl.value);
      if (!isFinite(coeff) || coeff <= 0 || coeff > 20) {
        showOkunError("Enter a positive Okun coefficient up to 20, for example 2. Zero does not work, because one direction divides by the coefficient.");
        return;
      }

      var gap;
      var du;
      var arithmetic;
      if (okunMode === "unemployment") {
        du = parseFloat(okunDuEl.value);
        if (!isFinite(du) || du < -30 || du > 30) {
          showOkunError("Enter a change in the unemployment rate between minus 30 and 30 percentage points.");
          return;
        }
        gap = -coeff * du;
        okunPrimaryLabel.textContent = "Implied GDP growth gap";
        okunPrimaryAmount.textContent = formatOkunSigned(gap);
        okunPrimaryDetail.textContent = "Percentage points. Actual real GDP growth minus trend growth. Negative means growth below trend.";
        arithmetic =
          "Growth gap equals minus " + formatOkunAbs(coeff) +
          " times " + signedWords(du) +
          ", which is " + signedWords(gap) +
          " percentage points.";
      } else {
        gap = parseFloat(okunGapEl.value);
        if (!isFinite(gap) || gap < -40 || gap > 40) {
          showOkunError("Enter a GDP growth gap between minus 40 and 40 percentage points.");
          return;
        }
        du = -gap / coeff;
        okunPrimaryLabel.textContent = "Implied change in unemployment";
        okunPrimaryAmount.textContent = formatOkunSigned(du);
        okunPrimaryDetail.textContent = "Percentage points. Positive means the unemployment rate rises. Negative means it falls.";
        arithmetic =
          "Change in unemployment equals minus (" + signedWords(gap) +
          " divided by " + formatOkunAbs(coeff) +
          "), which is " + signedWords(du) +
          " percentage points.";
      }

      var beta = 1 / coeff;
      okunArithmetic.textContent = arithmetic + " Shown to two decimal places.";
      okunWords.textContent = wordsForGap(gap) + " " + wordsForDu(du);
      okunBeta.textContent =
        "One divided by the coefficient is " + formatOkunAbs(beta) +
        ". Each extra percentage point of real GDP growth above trend lines up with the unemployment rate changing by about " +
        formatOkunAbs(beta) + " percentage points in the opposite direction.";
      okunSummary.textContent =
        "Coefficient " + formatOkunAbs(coeff) +
        ". GDP growth gap " + signedWords(gap) +
        " percentage points. Unemployment change " + signedWords(du) +
        " percentage points. Educational estimate only. Inputs are yours, not live official series.";
      okunResultEl.classList.add("visible");
    });

    if (okunResetBtn) {
      okunResetBtn.addEventListener("click", function () {
        okunCoeffEl.value = "2";
        okunDuEl.value = "1";
        okunGapEl.value = "2";
        setOkunMode("unemployment");
      });
    }
  }

  /* Yield curve spread calculator (long minus short, classroom labels only) */
  var yieldSpreadBtn = document.getElementById("calc-yield-spread");
  if (yieldSpreadBtn) {
    var ycPairEl = document.getElementById("yc-pair");
    var ycShortEl = document.getElementById("yc-short");
    var ycLongEl = document.getElementById("yc-long");
    var ycShortLabel = document.getElementById("yc-short-label");
    var ycLongLabel = document.getElementById("yc-long-label");
    var ycResultEl = document.getElementById("calc-yield-spread-result");
    var ycSpreadAmount = document.getElementById("yc-spread-amount");
    var ycSpreadFormula = document.getElementById("yc-spread-formula");
    var ycShapeAmount = document.getElementById("yc-shape-amount");
    var ycShapeDetail = document.getElementById("yc-shape-detail");
    var ycWords = document.getElementById("yc-words");
    var ycSummary = document.getElementById("yc-summary");
    var ycErrorEl = document.getElementById("calc-yield-spread-error");
    var ycResetBtn = document.getElementById("calc-yield-spread-reset");
    var YC_FLAT_BAND = 0.25;

    function showYieldSpreadError(msg) {
      ycErrorEl.textContent = msg;
      ycErrorEl.classList.add("visible");
      ycResultEl.classList.remove("visible");
    }
    function clearYieldSpreadError() {
      ycErrorEl.classList.remove("visible");
      ycErrorEl.textContent = "";
    }
    function formatYieldAbs(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function yieldWords(n) {
      var abs = formatYieldAbs(n);
      if (n < -0.0000001) return "minus " + abs;
      return abs;
    }
    function pairCopy(value) {
      if (value === "10y3m") {
        return {
          shortLabel: "Short term yield, 3 month (%)",
          longLabel: "Long term yield, 10 year (%)",
          pairName: "10 year minus 3 month",
          shortName: "3 month yield",
          longName: "10 year yield"
        };
      }
      return {
        shortLabel: "Short term yield, 2 year (%)",
        longLabel: "Long term yield, 10 year (%)",
        pairName: "10 year minus 2 year",
        shortName: "2 year yield",
        longName: "10 year yield"
      };
    }
    function applyPairLabels() {
      var copy = pairCopy(ycPairEl.value);
      ycShortLabel.textContent = copy.shortLabel;
      ycLongLabel.textContent = copy.longLabel;
      return copy;
    }
    function readTypedYield(el) {
      if (el.validity && el.validity.badInput) return { empty: false, value: NaN };
      var trimmed = (el.value || "").toString().trim();
      if (trimmed === "") return { empty: true, value: NaN };
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return { empty: false, value: NaN };
      var n = Number(trimmed);
      if (!isFinite(n)) return { empty: false, value: NaN };
      return { empty: false, value: n };
    }
    function shapeOf(spread) {
      if (spread < 0) return "inverted";
      if (spread <= YC_FLAT_BAND) return "flat";
      return "normal";
    }

    function calculateYieldSpread() {
      clearYieldSpreadError();
      var copy = applyPairLabels();
      var shortYield = readTypedYield(ycShortEl);
      var longYield = readTypedYield(ycLongEl);

      if (shortYield.empty) {
        showYieldSpreadError("Enter a short term yield. That box is empty.");
        return;
      }
      if (!isFinite(shortYield.value)) {
        showYieldSpreadError("Enter a short term yield as a finite number, for example 4.50.");
        return;
      }
      if (shortYield.value < -10 || shortYield.value > 40) {
        showYieldSpreadError("Enter a short term yield between minus 10 and 40 percent.");
        return;
      }
      if (longYield.empty) {
        showYieldSpreadError("Enter a long term yield. That box is empty.");
        return;
      }
      if (!isFinite(longYield.value)) {
        showYieldSpreadError("Enter a long term yield as a finite number, for example 4.10.");
        return;
      }
      if (longYield.value < -10 || longYield.value > 40) {
        showYieldSpreadError("Enter a long term yield between minus 10 and 40 percent.");
        return;
      }

      var spread = longYield.value - shortYield.value;
      var shape = shapeOf(spread);
      var spreadWords = yieldWords(spread);
      var shapeLabel = "Upward sloping (normal)";
      var shapeDetail = "The spread is above 0.25 percentage points.";
      var words =
        "The " + copy.pairName + " spread is " + spreadWords +
        " percentage points. The long yield is above the short yield by more than 0.25 percentage points, so this classroom pairing is upward sloping, the usual normal shape. This describes the numbers you typed. It is not a forecast of growth or of the next policy decision.";
      if (shape === "inverted") {
        shapeLabel = "Inverted";
        shapeDetail = "The spread is below 0. The short yield is higher than the long yield.";
        words =
          "The " + copy.pairName + " spread is " + spreadWords +
          " percentage points. The long yield is below the short yield, so this classroom pairing is inverted. Research literature has discussed a historical association between some inversions and later recessions. Timing varies. This is a description of the two yields you typed, not a recession probability and not a forecast.";
      } else if (shape === "flat") {
        shapeLabel = "Flat";
        shapeDetail = "The spread is from 0 through 0.25 percentage points, the classroom band this page calls near zero.";
        words =
          "The " + copy.pairName + " spread is " + spreadWords +
          " percentage points. It is not negative, and it sits within 0.25 percentage points of zero, so this page calls the shape flat. A flat reading describes these two yields. It is not a forecast.";
      }

      ycSpreadAmount.textContent = spreadWords;
      ycSpreadFormula.textContent =
        copy.longName + " " + yieldWords(longYield.value) +
        " minus " + copy.shortName + " " + yieldWords(shortYield.value) +
        " equals " + spreadWords + " percentage points.";
      ycShapeAmount.textContent = shapeLabel;
      ycShapeDetail.textContent = shapeDetail;
      ycWords.textContent = words;
      ycSummary.textContent =
        copy.pairName + " spread " + spreadWords +
        " percentage points. Shape: " + shapeLabel +
        ". Educational estimate only. Inputs are yours, not live official series.";
      ycResultEl.classList.add("visible");
    }

    yieldSpreadBtn.addEventListener("click", calculateYieldSpread);
    ycPairEl.addEventListener("change", function () {
      applyPairLabels();
      if (ycResultEl.classList.contains("visible")) calculateYieldSpread();
    });

    if (ycResetBtn) {
      ycResetBtn.addEventListener("click", function () {
        ycPairEl.value = "10y2y";
        ycShortEl.value = "4.50";
        ycLongEl.value = "4.10";
        applyPairLabels();
        clearYieldSpreadError();
        ycResultEl.classList.remove("visible");
      });
    }
  }

  /* Phillips curve calculator (expectations augmented classroom sketch) */
  var phillipsCalcBtn = document.getElementById("calc-phillips");
  if (phillipsCalcBtn) {
    var phillipsExpectedEl = document.getElementById("phillips-expected");
    var phillipsNaturalEl = document.getElementById("phillips-natural");
    var phillipsSlopeEl = document.getElementById("phillips-slope");
    var phillipsUEl = document.getElementById("phillips-u");
    var phillipsInflEl = document.getElementById("phillips-inflation");
    var phillipsUnemploymentFields = document.getElementById("phillips-unemployment-fields");
    var phillipsInflationFields = document.getElementById("phillips-inflation-fields");
    var phillipsModeUnemploymentBtn = document.getElementById("phillips-mode-unemployment");
    var phillipsModeInflationBtn = document.getElementById("phillips-mode-inflation");
    var phillipsResultEl = document.getElementById("calc-phillips-result");
    var phillipsPrimaryLabel = document.getElementById("phillips-primary-label");
    var phillipsPrimaryAmount = document.getElementById("phillips-primary-amount");
    var phillipsPrimaryDetail = document.getElementById("phillips-primary-detail");
    var phillipsUgapAmount = document.getElementById("phillips-ugap-amount");
    var phillipsUgapDetail = document.getElementById("phillips-ugap-detail");
    var phillipsIgapAmount = document.getElementById("phillips-igap-amount");
    var phillipsIgapDetail = document.getElementById("phillips-igap-detail");
    var phillipsArithmetic = document.getElementById("phillips-arithmetic");
    var phillipsWords = document.getElementById("phillips-words");
    var phillipsSummary = document.getElementById("phillips-summary");
    var phillipsErrorEl = document.getElementById("calc-phillips-error");
    var phillipsResetBtn = document.getElementById("calc-phillips-reset");
    var phillipsMode = "unemployment";

    function showPhillipsError(msg) {
      phillipsErrorEl.textContent = msg;
      phillipsErrorEl.classList.add("visible");
      phillipsResultEl.classList.remove("visible");
    }
    function clearPhillipsError() {
      phillipsErrorEl.classList.remove("visible");
      phillipsErrorEl.textContent = "";
    }
    function formatPhillipsAbs(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatPhillipsSigned(n) {
      var abs = formatPhillipsAbs(n);
      if (n < -0.0000001) return "\u2212" + abs;
      if (n > 0.0000001) return "+" + abs;
      return "0.00";
    }
    function formatPhillipsLevel(n) {
      var abs = formatPhillipsAbs(n);
      if (n < -0.0000001) return "\u2212" + abs + "%";
      return abs + "%";
    }
    function phillipsNumberWords(n) {
      var abs = formatPhillipsAbs(n);
      if (n < -0.0000001) return "minus " + abs;
      if (n > 0.0000001) return abs;
      return "0.00";
    }
    function phillipsPointPhrase(n) {
      var absValue = Math.abs(n);
      var unit = Math.abs(absValue - 1) < 0.005 ? "percentage point" : "percentage points";
      return formatPhillipsAbs(n) + " " + unit;
    }
    function readPhillipsNumber(el) {
      if (el.validity && el.validity.badInput) return { empty: false, value: NaN };
      var trimmed = (el.value || "").toString().trim();
      if (trimmed === "") return { empty: true, value: NaN };
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) return { empty: false, value: NaN };
      var n = Number(trimmed);
      if (!isFinite(n)) return { empty: false, value: NaN };
      return { empty: false, value: n };
    }
    function hidePhillipsResult() {
      phillipsResultEl.classList.remove("visible");
      clearPhillipsError();
    }
    function setPhillipsMode(mode) {
      phillipsMode = mode;
      var fromUnemployment = mode === "unemployment";
      phillipsUnemploymentFields.hidden = !fromUnemployment;
      phillipsInflationFields.hidden = fromUnemployment;
      phillipsModeUnemploymentBtn.className = fromUnemployment ? "btn" : "btn btn-secondary";
      phillipsModeInflationBtn.className = fromUnemployment ? "btn btn-secondary" : "btn";
      phillipsModeUnemploymentBtn.setAttribute("aria-pressed", fromUnemployment ? "true" : "false");
      phillipsModeInflationBtn.setAttribute("aria-pressed", fromUnemployment ? "false" : "true");
      hidePhillipsResult();
    }
    function wordsForUnemploymentGap(gap) {
      if (gap > 0.005) {
        return "Unemployment sits " + phillipsPointPhrase(gap) + " above the natural rate.";
      }
      if (gap < -0.005) {
        return "Unemployment sits " + phillipsPointPhrase(gap) + " below the natural rate.";
      }
      return "Unemployment matches the natural rate.";
    }
    function wordsForInflationGap(gap) {
      if (gap > 0.005) {
        return "Inflation sits " + phillipsPointPhrase(gap) + " above expected inflation.";
      }
      if (gap < -0.005) {
        return "Inflation sits " + phillipsPointPhrase(gap) + " below expected inflation.";
      }
      return "Inflation matches expected inflation.";
    }

    phillipsModeUnemploymentBtn.addEventListener("click", function () {
      setPhillipsMode("unemployment");
    });
    phillipsModeInflationBtn.addEventListener("click", function () {
      setPhillipsMode("inflation");
    });

    phillipsCalcBtn.addEventListener("click", function () {
      clearPhillipsError();
      var expected = readPhillipsNumber(phillipsExpectedEl);
      var natural = readPhillipsNumber(phillipsNaturalEl);
      var slope = readPhillipsNumber(phillipsSlopeEl);

      if (expected.empty) {
        showPhillipsError("Enter expected inflation. That box is empty.");
        return;
      }
      if (!isFinite(expected.value) || expected.value < -20 || expected.value > 100) {
        showPhillipsError("Enter expected inflation between minus 20 and 100 percent.");
        return;
      }
      if (natural.empty) {
        showPhillipsError("Enter a natural rate of unemployment. That box is empty.");
        return;
      }
      if (!isFinite(natural.value) || natural.value < 0 || natural.value > 40) {
        showPhillipsError("Enter a natural rate of unemployment between 0 and 40 percent.");
        return;
      }
      if (slope.empty) {
        showPhillipsError("Enter a slope. That box is empty.");
        return;
      }
      if (!isFinite(slope.value) || slope.value < 0.01 || slope.value > 10) {
        showPhillipsError("Enter a positive slope from 0.01 to 10. Example: 0.5. The formula already subtracts slope times the unemployment gap, and one direction divides by the slope.");
        return;
      }

      var u;
      var pi;
      var arithmetic;
      if (phillipsMode === "unemployment") {
        var typedU = readPhillipsNumber(phillipsUEl);
        if (typedU.empty) {
          showPhillipsError("Enter an unemployment rate. That box is empty.");
          return;
        }
        if (!isFinite(typedU.value) || typedU.value < 0 || typedU.value > 50) {
          showPhillipsError("Enter an unemployment rate between 0 and 50 percent.");
          return;
        }
        u = typedU.value;
        var uGapFromU = u - natural.value;
        pi = expected.value - slope.value * uGapFromU;
        phillipsPrimaryLabel.textContent = "Implied inflation";
        phillipsPrimaryAmount.textContent = formatPhillipsLevel(pi);
        phillipsPrimaryDetail.textContent = "Percent. Expected inflation minus the slope times the unemployment gap.";
        arithmetic =
          "Inflation equals " + phillipsNumberWords(expected.value) +
          " minus " + formatPhillipsAbs(slope.value) +
          " times " + phillipsNumberWords(uGapFromU) +
          ", which is " + phillipsNumberWords(pi) +
          " percent.";
      } else {
        var typedPi = readPhillipsNumber(phillipsInflEl);
        if (typedPi.empty) {
          showPhillipsError("Enter an inflation rate. That box is empty.");
          return;
        }
        if (!isFinite(typedPi.value) || typedPi.value < -20 || typedPi.value > 100) {
          showPhillipsError("Enter an inflation rate between minus 20 and 100 percent.");
          return;
        }
        pi = typedPi.value;
        var iGapInput = pi - expected.value;
        var uGapSolved = -iGapInput / slope.value;
        u = natural.value + uGapSolved;
        phillipsPrimaryLabel.textContent = "Implied unemployment rate";
        phillipsPrimaryAmount.textContent = formatPhillipsLevel(u);
        phillipsPrimaryDetail.textContent = "Percent. The natural rate plus the unemployment gap implied by the inflation gap.";
        arithmetic =
          "The unemployment gap equals minus (" + phillipsNumberWords(iGapInput) +
          " divided by " + formatPhillipsAbs(slope.value) +
          "), which is " + phillipsNumberWords(uGapSolved) +
          ". Unemployment equals the natural rate of " + phillipsNumberWords(natural.value) +
          " plus a gap of " + phillipsNumberWords(uGapSolved) +
          ", which is " + phillipsNumberWords(u) +
          " percent.";
      }

      if (!isFinite(pi) || !isFinite(u)) {
        showPhillipsError("Those inputs do not produce a finite result. Check the slope and try again.");
        return;
      }

      var uGap = u - natural.value;
      var iGap = pi - expected.value;
      var outside = "";
      if (u < -0.005) {
        outside = " The implied unemployment rate is below zero. That is arithmetic from these assumptions, not a labour market that can exist.";
      } else if (u > 50.005) {
        outside = " The implied unemployment rate is above 50 percent. Treat that as a sign the slope or the inflation gap is outside a usual classroom range.";
      }

      phillipsUgapAmount.textContent = formatPhillipsSigned(uGap);
      phillipsUgapDetail.textContent =
        "Percentage points. Unemployment rate " + phillipsNumberWords(u) +
        " minus natural rate " + phillipsNumberWords(natural.value) +
        ". " + wordsForUnemploymentGap(uGap);
      phillipsIgapAmount.textContent = formatPhillipsSigned(iGap);
      phillipsIgapDetail.textContent =
        "Percentage points. Inflation " + phillipsNumberWords(pi) +
        " minus expected inflation " + phillipsNumberWords(expected.value) +
        ". " + wordsForInflationGap(iGap);
      phillipsArithmetic.textContent =
        arithmetic + " The inflation gap equals minus " + formatPhillipsAbs(slope.value) +
        " times the unemployment gap, which is " + phillipsNumberWords(iGap) +
        " percentage points. Shown to two decimal places.";
      phillipsWords.textContent =
        wordsForUnemploymentGap(uGap) + " " + wordsForInflationGap(iGap) +
        " With a slope of " + formatPhillipsAbs(slope.value) +
        ", a higher unemployment gap lines up with inflation further below expectations." +
        outside;
      phillipsSummary.textContent =
        "Expected inflation " + phillipsNumberWords(expected.value) +
        " percent. Natural rate " + phillipsNumberWords(natural.value) +
        " percent. Slope " + formatPhillipsAbs(slope.value) +
        ". Unemployment " + phillipsNumberWords(u) +
        " percent. Inflation " + phillipsNumberWords(pi) +
        " percent. Educational estimate only. Not a forecast, not policy advice, and not investment advice. Inputs are yours, not live official series.";
      phillipsResultEl.classList.add("visible");
    });

    if (phillipsResetBtn) {
      phillipsResetBtn.addEventListener("click", function () {
        phillipsExpectedEl.value = "2";
        phillipsNaturalEl.value = "4.5";
        phillipsSlopeEl.value = "0.5";
        phillipsUEl.value = "5.5";
        phillipsInflEl.value = "2.5";
        setPhillipsMode("unemployment");
      });
    }
  }
})();
