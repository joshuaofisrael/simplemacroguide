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

  /* Output gap calculator (percent of potential, classroom definition) */
  var outputGapCalcBtn = document.getElementById("calc-output-gap");
  if (outputGapCalcBtn) {
    var gapActualEl = document.getElementById("gap-actual");
    var gapPotentialEl = document.getElementById("gap-potential");
    var gapSolveActualEl = document.getElementById("gap-solve-actual");
    var gapSolveFromActualEl = document.getElementById("gap-solve-from-actual");
    var gapSolvePotentialEl = document.getElementById("gap-solve-potential");
    var gapSolveFromPotentialEl = document.getElementById("gap-solve-from-potential");
    var gapLevelsFields = document.getElementById("gap-levels-fields");
    var gapPotentialFields = document.getElementById("gap-potential-fields");
    var gapActualFields = document.getElementById("gap-actual-fields");
    var gapModeHint = document.getElementById("gap-mode-hint");
    var gapModePercentBtn = document.getElementById("gap-mode-percent");
    var gapModeLevelsBtn = document.getElementById("gap-mode-levels");
    var gapModePotentialBtn = document.getElementById("gap-mode-potential");
    var gapModeActualBtn = document.getElementById("gap-mode-actual");
    var gapResultEl = document.getElementById("calc-output-gap-result");
    var gapPercentAmount = document.getElementById("gap-percent-amount");
    var gapPercentDetail = document.getElementById("gap-percent-detail");
    var gapAbsoluteAmount = document.getElementById("gap-absolute-amount");
    var gapAbsoluteDetail = document.getElementById("gap-absolute-detail");
    var gapReadNote = document.getElementById("gap-read-note");
    var gapArithmetic = document.getElementById("gap-arithmetic");
    var gapSummary = document.getElementById("gap-summary");
    var gapErrorEl = document.getElementById("calc-output-gap-error");
    var gapResetBtn = document.getElementById("calc-output-gap-reset");
    var gapMode = "percent";
    var gapModeButtons = [gapModePercentBtn, gapModeLevelsBtn, gapModePotentialBtn, gapModeActualBtn];
    var gapLevelMax = 1000000000000000;

    function showGapError(msg) {
      gapErrorEl.textContent = msg;
      gapErrorEl.classList.add("visible");
      gapResultEl.classList.remove("visible");
    }
    function clearGapError() {
      gapErrorEl.classList.remove("visible");
      gapErrorEl.textContent = "";
    }
    function formatGapAbs(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatGapSigned(n) {
      var abs = formatGapAbs(n);
      if (n < -0.0000001) return "\u2212" + abs;
      if (n > 0.0000001) return "+" + abs;
      return "0.00";
    }
    function formatGapLevel(n) {
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function gapSignedWords(n) {
      var abs = formatGapAbs(n);
      if (n < -0.0000001) return "minus " + abs;
      if (n > 0.0000001) return "plus " + abs;
      return "0.00";
    }
    function formatGapDecimal(n) {
      var rounded = Math.round(n * 10000) / 10000;
      var text = rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4
      });
      return text;
    }
    function hideGapResult() {
      gapResultEl.classList.remove("visible");
      clearGapError();
    }
    function readGapLevel(el, label, allowZero) {
      var n = parseFloat(el.value);
      if (!isFinite(n) || n > gapLevelMax || n < 0 || (n === 0 && !allowZero)) {
        return {
          ok: false,
          message: allowZero
            ? "Enter " + label + " as a number from 0 up to 1,000,000,000,000,000. Use the same units for actual and potential output."
            : "Enter " + label + " as a positive number up to 1,000,000,000,000,000. The percent gap divides by potential, so zero does not work."
        };
      }
      return { ok: true, value: n };
    }
    function readGapPercent(el) {
      var n = parseFloat(el.value);
      if (!isFinite(n) || n <= -100 || n > 500) {
        return {
          ok: false,
          message: "Enter an output gap greater than minus 100 and up to 500 percent. A gap of minus 100 percent would put actual output at zero."
        };
      }
      return { ok: true, value: n };
    }
    function setGapMode(mode) {
      gapMode = mode;
      gapLevelsFields.hidden = mode !== "percent" && mode !== "levels";
      gapPotentialFields.hidden = mode !== "implied-potential";
      gapActualFields.hidden = mode !== "implied-actual";
      var activeBtn = gapModePercentBtn;
      var hint = "Percent of potential uses actual output Y and potential output Y*. The gap in percent is ((Y minus Y*) divided by Y*) times 100.";
      if (mode === "levels") {
        activeBtn = gapModeLevelsBtn;
        hint = "From levels uses the same inputs as percent of potential: actual output Y and potential output Y*. It reports the percent gap and the absolute gap, Y minus Y*, in the units you typed.";
      } else if (mode === "implied-potential") {
        activeBtn = gapModePotentialBtn;
        hint = "Implied potential starts from actual output and a gap percent, then solves for potential. Potential equals actual divided by (1 plus the gap in decimal form). A 2 percent gap has decimal form 0.02.";
      } else if (mode === "implied-actual") {
        activeBtn = gapModeActualBtn;
        hint = "Implied actual starts from potential output and a gap percent, then solves for actual output. Actual equals potential times (1 plus the gap in decimal form). A 2 percent gap has decimal form 0.02.";
      }
      var i;
      for (i = 0; i < gapModeButtons.length; i++) {
        var on = gapModeButtons[i] === activeBtn;
        gapModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        gapModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      gapModeHint.textContent = hint;
      hideGapResult();
    }

    gapModePercentBtn.addEventListener("click", function () {
      setGapMode("percent");
    });
    gapModeLevelsBtn.addEventListener("click", function () {
      setGapMode("levels");
    });
    gapModePotentialBtn.addEventListener("click", function () {
      setGapMode("implied-potential");
    });
    gapModeActualBtn.addEventListener("click", function () {
      setGapMode("implied-actual");
    });

    outputGapCalcBtn.addEventListener("click", function () {
      clearGapError();
      var y;
      var yStar;
      var gapPct;
      var absGap;
      var arithmetic;

      if (gapMode === "percent" || gapMode === "levels") {
        var actual = readGapLevel(gapActualEl, "actual output", true);
        if (!actual.ok) {
          showGapError(actual.message);
          return;
        }
        var potential = readGapLevel(gapPotentialEl, "potential output", false);
        if (!potential.ok) {
          showGapError(potential.message);
          return;
        }
        y = actual.value;
        yStar = potential.value;
        gapPct = ((y - yStar) / yStar) * 100;
        absGap = y - yStar;
        if (!isFinite(gapPct) || Math.abs(gapPct) > 1000) {
          showGapError("Those levels imply an output gap beyond 1,000 percent of potential. Check that actual and potential use the same units.");
          return;
        }
        arithmetic =
          "Percent gap equals (" + formatGapLevel(y) + " minus " + formatGapLevel(yStar) +
          ") divided by " + formatGapLevel(yStar) +
          ", times 100, which is " + gapSignedWords(gapPct) +
          ". Absolute gap equals " + formatGapLevel(y) + " minus " + formatGapLevel(yStar) +
          ", which is " + gapSignedWords(absGap) + ".";
      } else if (gapMode === "implied-potential") {
        var knownActual = readGapLevel(gapSolveActualEl, "actual output", false);
        if (!knownActual.ok) {
          showGapError(knownActual.message);
          return;
        }
        var typedGap = readGapPercent(gapSolveFromActualEl);
        if (!typedGap.ok) {
          showGapError(typedGap.message);
          return;
        }
        y = knownActual.value;
        gapPct = typedGap.value;
        yStar = y / (1 + gapPct / 100);
        if (!isFinite(yStar) || yStar <= 0 || yStar > gapLevelMax) {
          showGapError("Those inputs do not produce a usable potential level. Check the gap percent and the actual output.");
          return;
        }
        absGap = y - yStar;
        arithmetic =
          "Potential equals " + formatGapLevel(y) +
          " divided by (1 plus " + formatGapDecimal(gapPct / 100) +
          "), which is " + formatGapLevel(yStar) +
          ". Absolute gap equals " + formatGapLevel(y) + " minus " + formatGapLevel(yStar) +
          ", which is " + gapSignedWords(absGap) + ".";
      } else {
        var knownPotential = readGapLevel(gapSolvePotentialEl, "potential output", false);
        if (!knownPotential.ok) {
          showGapError(knownPotential.message);
          return;
        }
        var typedGapFromPotential = readGapPercent(gapSolveFromPotentialEl);
        if (!typedGapFromPotential.ok) {
          showGapError(typedGapFromPotential.message);
          return;
        }
        yStar = knownPotential.value;
        gapPct = typedGapFromPotential.value;
        y = yStar * (1 + gapPct / 100);
        if (!isFinite(y) || y < 0 || y > gapLevelMax) {
          showGapError("Those inputs do not produce a usable actual output level. Check the gap percent and potential output.");
          return;
        }
        absGap = y - yStar;
        arithmetic =
          "Actual output equals " + formatGapLevel(yStar) +
          " times (1 plus " + formatGapDecimal(gapPct / 100) +
          "), which is " + formatGapLevel(y) +
          ". Absolute gap equals " + formatGapLevel(y) + " minus " + formatGapLevel(yStar) +
          ", which is " + gapSignedWords(absGap) + ".";
      }

      var readNote;
      if (gapPct > 0.005) {
        readNote = "Actual output sits above potential by " + formatGapAbs(gapPct) +
          " percent of potential. A positive gap means activity is above the sustainable benchmark in these numbers.";
      } else if (gapPct < -0.005) {
        readNote = "Actual output sits below potential by " + formatGapAbs(gapPct) +
          " percent of potential. A negative gap is the classroom reading of spare capacity in output.";
      } else {
        readNote = "Actual output matches potential under these numbers, so the gap is about zero.";
      }
      if (gapMode === "implied-potential") {
        readNote += " Potential output is the solved level.";
      } else if (gapMode === "implied-actual") {
        readNote += " Actual output is the solved level.";
      }
      readNote += " The absolute gap is " + gapSignedWords(absGap) +
        " in the same units as the levels. These are numbers you typed, not a live official estimate.";

      gapPercentAmount.textContent = formatGapSigned(gapPct) + "%";
      gapPercentDetail.textContent = "Percent of potential. Positive means actual output is above potential. Negative means it is below potential.";
      gapAbsoluteAmount.textContent = formatGapSigned(absGap);
      gapAbsoluteDetail.textContent =
        "Actual output " + formatGapLevel(y) +
        " minus potential output " + formatGapLevel(yStar) +
        ", in the units you typed.";
      gapReadNote.textContent = readNote;
      gapArithmetic.textContent = arithmetic + " Shown to two decimal places.";
      gapSummary.textContent =
        "Actual output " + formatGapLevel(y) +
        ". Potential output " + formatGapLevel(yStar) +
        ". Output gap " + gapSignedWords(gapPct) +
        " percent. Absolute gap " + gapSignedWords(absGap) +
        ". Educational estimate only. Not a forecast and not investment advice.";
      gapResultEl.classList.add("visible");
    });

    if (gapResetBtn) {
      gapResetBtn.addEventListener("click", function () {
        gapActualEl.value = "102";
        gapPotentialEl.value = "100";
        gapSolveActualEl.value = "102";
        gapSolveFromActualEl.value = "2";
        gapSolvePotentialEl.value = "100";
        gapSolveFromPotentialEl.value = "2";
        setGapMode("percent");
      });
    }
  }

  /* Fiscal multiplier calculator (classroom spending multiplier) */
  var fiscalMultCalcBtn = document.getElementById("calc-fiscal-multiplier");
  if (fiscalMultCalcBtn) {
    var fmMpcEl = document.getElementById("fm-mpc");
    var fmMpiEl = document.getElementById("fm-mpi");
    var fmKEl = document.getElementById("fm-k");
    var fmImpulseEl = document.getElementById("fm-impulse");
    var fmMpcFields = document.getElementById("fm-mpc-fields");
    var fmMpiFields = document.getElementById("fm-mpi-fields");
    var fmKFields = document.getElementById("fm-k-fields");
    var fmModeHint = document.getElementById("fm-mode-hint");
    var fmImpulseLabel = document.getElementById("fm-impulse-label");
    var fmImpulseHint = document.getElementById("fm-impulse-hint");
    var fmModeClosedBtn = document.getElementById("fm-mode-closed");
    var fmModeOpenBtn = document.getElementById("fm-mode-open");
    var fmModePublishedBtn = document.getElementById("fm-mode-published");
    var fmResultEl = document.getElementById("calc-fiscal-multiplier-result");
    var fmMultiplierAmount = document.getElementById("fm-multiplier-amount");
    var fmMultiplierDetail = document.getElementById("fm-multiplier-detail");
    var fmGdpBlock = document.getElementById("fm-gdp-block");
    var fmGdpAmount = document.getElementById("fm-gdp-amount");
    var fmGdpDetail = document.getElementById("fm-gdp-detail");
    var fmReadNote = document.getElementById("fm-read-note");
    var fmArithmetic = document.getElementById("fm-arithmetic");
    var fmSummary = document.getElementById("fm-summary");
    var fmErrorEl = document.getElementById("calc-fiscal-multiplier-error");
    var fmResetBtn = document.getElementById("calc-fiscal-multiplier-reset");
    var fmMode = "closed";
    var fmModeButtons = [fmModeClosedBtn, fmModeOpenBtn, fmModePublishedBtn];
    var fmImpulseMax = 1000000000000;
    var fmMultiplierMax = 10000;

    function showFmError(msg) {
      fmErrorEl.textContent = msg;
      fmErrorEl.classList.add("visible");
      fmResultEl.classList.remove("visible");
    }
    function clearFmError() {
      fmErrorEl.classList.remove("visible");
      fmErrorEl.textContent = "";
    }
    function formatFmAbs(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatFmSigned(n) {
      var abs = formatFmAbs(n);
      if (n < -0.0000001) return "\u2212" + abs;
      if (n > 0.0000001) return "+" + abs;
      return "0.00";
    }
    function formatFmPlain(n) {
      var rounded = Math.round(n * 10000) / 10000;
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4
      });
    }
    function fmWords(n) {
      var abs = formatFmAbs(n);
      if (n < -0.0000001) return "minus " + abs;
      return abs;
    }
    function hideFmResult() {
      fmResultEl.classList.remove("visible");
      clearFmError();
    }
    function readFmPropensity(el, name, closedMpc) {
      var raw = String(el.value).trim();
      var rangeMessage = "Enter a " + name + " from 0 up to, but not including, 1.";
      if (raw === "") {
        return { ok: false, message: rangeMessage };
      }
      var n = parseFloat(raw);
      if (!isFinite(n) || n < 0) {
        return { ok: false, message: rangeMessage };
      }
      if (n >= 1) {
        if (closedMpc) {
          return {
            ok: false,
            message: "Enter a marginal propensity to consume below 1. At 1 or above, the denominator, 1 minus MPC, is zero or negative, so the sketch does not apply."
          };
        }
        return { ok: false, message: rangeMessage };
      }
      return { ok: true, value: n };
    }
    function readFmMultiplier(el) {
      var raw = String(el.value).trim();
      if (raw === "" || !isFinite(parseFloat(raw)) || parseFloat(raw) <= 0 || parseFloat(raw) > fmMultiplierMax) {
        return {
          ok: false,
          message: "Enter a multiplier greater than 0 and up to 10,000. This mode uses a figure you type. It does not look up a CBO, OBR, or IMF estimate."
        };
      }
      return { ok: true, value: parseFloat(raw) };
    }
    function readFmImpulse(el, noun) {
      var raw = String(el.value).trim();
      if (raw === "") return { ok: true, provided: false };
      var n = parseFloat(raw);
      if (!isFinite(n) || Math.abs(n) > fmImpulseMax) {
        return {
          ok: false,
          message: "Enter " + noun + " between minus 1,000,000,000,000 and 1,000,000,000,000, or leave the field blank."
        };
      }
      return { ok: true, provided: true, value: n };
    }
    function setFmMode(mode) {
      fmMode = mode;
      fmMpcFields.hidden = mode === "published";
      fmMpiFields.hidden = mode !== "open";
      fmKFields.hidden = mode !== "published";
      var activeBtn = fmModeClosedBtn;
      var hint = "Closed economy uses the marginal propensity to consume. The spending multiplier is 1 divided by (1 minus MPC). An optional government spending change then scales into an implied GDP change.";
      var impulseLabel = "Government spending change, \u0394G (optional)";
      var impulseHint = "Optional. Extra government spending in classroom units you choose. Defaults use 10. With the default MPC, the implied GDP change is 50. Leave blank if you only want the multiplier. A negative number is a spending cut.";
      if (mode === "open") {
        activeBtn = fmModeOpenBtn;
        hint = "Open economy uses MPC and the marginal propensity to import. The multiplier is 1 divided by (1 minus MPC plus MPI). A positive MPI is an extra leakage, so the multiplier is smaller than the closed economy figure with the same MPC. An optional government spending change scales into an implied GDP change.";
        impulseHint = "Optional. Same spending change as in the closed economy mode. Defaults use 10. With the default MPC and MPI, the implied GDP change is 25. Leave blank if you only want the multiplier. A negative number is a spending cut.";
      } else if (mode === "published") {
        activeBtn = fmModePublishedBtn;
        hint = "This mode starts from a multiplier you type, then multiplies it by a fiscal impulse. Use it when you have already read a figure in a CBO, OBR, or IMF discussion. This page does not look up that figure and does not treat the product as official scorekeeping.";
        impulseLabel = "Fiscal impulse (optional)";
        impulseHint = "Optional. Positive means an expansionary spending style impulse, such as higher government spending. Negative means a contractionary impulse. A tax increase can be entered as a negative number. A tax cut can be entered as a positive number. Tax multipliers often differ from spending multipliers, so type a k you have already chosen. This page does not invent a tax coefficient. Leave blank to keep only the multiplier you typed.";
      }
      var i;
      for (i = 0; i < fmModeButtons.length; i++) {
        var on = fmModeButtons[i] === activeBtn;
        fmModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        fmModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      fmModeHint.textContent = hint;
      fmImpulseLabel.textContent = impulseLabel;
      fmImpulseHint.textContent = impulseHint;
      hideFmResult();
    }

    fmModeClosedBtn.addEventListener("click", function () {
      setFmMode("closed");
    });
    fmModeOpenBtn.addEventListener("click", function () {
      setFmMode("open");
    });
    fmModePublishedBtn.addEventListener("click", function () {
      setFmMode("published");
    });

    fiscalMultCalcBtn.addEventListener("click", function () {
      clearFmError();
      var k;
      var denom;
      var mpc = null;
      var mpi = null;
      var arithmetic;
      var multiplierDetail;
      var impulseNoun = fmMode === "published" ? "a fiscal impulse" : "a government spending change";
      var impulse = readFmImpulse(fmImpulseEl, impulseNoun);
      if (!impulse.ok) {
        showFmError(impulse.message);
        return;
      }

      if (fmMode === "published") {
        var typedK = readFmMultiplier(fmKEl);
        if (!typedK.ok) {
          showFmError(typedK.message);
          return;
        }
        k = typedK.value;
        multiplierDetail = "The multiplier you typed. This mode does not derive it from an MPC.";
        arithmetic = "";
      } else {
        var typedMpc = readFmPropensity(fmMpcEl, "marginal propensity to consume", fmMode === "closed");
        if (!typedMpc.ok) {
          showFmError(typedMpc.message);
          return;
        }
        mpc = typedMpc.value;
        if (fmMode === "open") {
          var typedMpi = readFmPropensity(fmMpiEl, "marginal propensity to import", false);
          if (!typedMpi.ok) {
            showFmError(typedMpi.message);
            return;
          }
          mpi = typedMpi.value;
          denom = 1 - mpc + mpi;
          if (!(denom > 0.000000000001)) {
            showFmError("The denominator, 1 minus MPC plus MPI, is zero or negative. This formula needs that denominator to stay positive.");
            return;
          }
          k = 1 / denom;
          multiplierDetail = "Units of GDP per unit of government spending. Equals 1 divided by (1 minus MPC plus MPI).";
          arithmetic =
            "1 minus " + formatFmPlain(mpc) + " plus " + formatFmPlain(mpi) +
            " is " + formatFmPlain(denom) +
            ". The multiplier equals 1 divided by " + formatFmPlain(denom) +
            ", which is " + formatFmAbs(k) + ".";
        } else {
          denom = 1 - mpc;
          if (!(denom > 0.000000000001)) {
            showFmError("The denominator, 1 minus MPC, is zero or negative. This formula needs that denominator to stay positive.");
            return;
          }
          k = 1 / denom;
          multiplierDetail = "Units of GDP per unit of government spending. Equals 1 divided by (1 minus MPC).";
          arithmetic =
            "1 minus " + formatFmPlain(mpc) +
            " is " + formatFmPlain(denom) +
            ". The multiplier equals 1 divided by " + formatFmPlain(denom) +
            ", which is " + formatFmAbs(k) + ".";
        }
        if (!isFinite(k) || k > fmMultiplierMax) {
          showFmError("Those inputs imply a multiplier above 10,000. Move the propensity a bit farther below 1 so this classroom display can show the result.");
          return;
        }
      }

      var dy = null;
      if (impulse.provided) {
        dy = k * impulse.value;
        if (!isFinite(dy) || Math.abs(dy) > fmImpulseMax * fmMultiplierMax) {
          showFmError("Those inputs imply a GDP change this classroom display cannot show. Use a smaller impulse or a smaller multiplier.");
          return;
        }
        if (fmMode === "published") {
          arithmetic = "The multiplier is the figure you typed, " + formatFmAbs(k) +
            ". Implied GDP change equals that multiplier times " + fmWords(impulse.value) +
            ", which is " + fmWords(dy) + ".";
        } else {
          arithmetic += " Implied GDP change equals the multiplier times " + fmWords(impulse.value) +
            ", which is " + fmWords(dy) + ".";
        }
      } else if (fmMode !== "published") {
        arithmetic += " No spending change was entered, so there is no implied GDP change.";
      } else {
        arithmetic = "No fiscal impulse was entered, so the result is the multiplier you typed, " + formatFmAbs(k) + ".";
      }
      arithmetic += " Shown to two decimal places.";

      var readNote;
      if (fmMode === "published") {
        readNote = "You typed this multiplier. The page does not derive it from an MPC and does not check it against a CBO, OBR, or IMF publication. ";
      } else if (fmMode === "open") {
        if (mpi > 0.0000001) {
          readNote = "Imports add a leakage, so this multiplier is smaller than the closed economy multiplier with the same MPC. ";
        } else {
          readNote = "With an MPI of zero, this open economy sketch matches the closed economy multiplier for the same MPC. ";
        }
      } else {
        readNote = "In this closed economy sketch, income that is not consumed leaks into saving, and the multiplier is the sum of the resulting spending rounds. ";
      }
      readNote += "A multiplier of " + formatFmAbs(k) + " means one extra unit of impulse lines up with about " + formatFmAbs(k) + " units of GDP under these assumptions. ";
      if (!impulse.provided) {
        readNote += "No impulse was entered, so there is no implied GDP change. ";
      } else if (dy > 0.005) {
        readNote += "The implied GDP change is positive, so output rises in this sketch. ";
      } else if (dy < -0.005) {
        readNote += "The implied GDP change is negative, so output falls in this sketch. ";
      } else {
        readNote += "The implied GDP change is about zero. ";
      }
      if (fmMode === "published") {
        readNote += "Tax multipliers often differ from spending multipliers. If this impulse is a tax change, both the sign and the multiplier need to be ones you chose. ";
      }
      readNote += "This is classroom arithmetic, not scorekeeping, not a forecast, and not a recommendation of any budget package.";

      fmMultiplierAmount.textContent = formatFmAbs(k);
      fmMultiplierDetail.textContent = multiplierDetail;
      if (impulse.provided) {
        fmGdpBlock.hidden = false;
        fmGdpAmount.textContent = formatFmSigned(dy);
        fmGdpDetail.textContent = "Multiplier times the impulse, in the same units you typed. Classroom arithmetic, not an official score.";
      } else {
        fmGdpBlock.hidden = true;
        fmGdpAmount.textContent = "";
        fmGdpDetail.textContent = "";
      }
      fmReadNote.textContent = readNote;
      fmArithmetic.textContent = arithmetic;

      if (fmMode === "published") {
        fmSummary.textContent = "Multiplier " + formatFmAbs(k) +
          (impulse.provided ? ". Fiscal impulse " + fmWords(impulse.value) + ". Implied GDP change " + fmWords(dy) + ". " : ". No fiscal impulse entered. ") +
          "Educational estimate only. Not a forecast and not investment advice.";
      } else if (fmMode === "open") {
        fmSummary.textContent = "MPC " + formatFmPlain(mpc) +
          ". MPI " + formatFmPlain(mpi) +
          ". Multiplier " + formatFmAbs(k) +
          (impulse.provided ? ". Government spending change " + fmWords(impulse.value) + ". Implied GDP change " + fmWords(dy) + ". " : ". No government spending change entered. ") +
          "Educational estimate only. Not a forecast and not investment advice.";
      } else {
        fmSummary.textContent = "MPC " + formatFmPlain(mpc) +
          ". Multiplier " + formatFmAbs(k) +
          (impulse.provided ? ". Government spending change " + fmWords(impulse.value) + ". Implied GDP change " + fmWords(dy) + ". " : ". No government spending change entered. ") +
          "Educational estimate only. Not a forecast and not investment advice.";
      }
      fmResultEl.classList.add("visible");
    });

    if (fmResetBtn) {
      fmResetBtn.addEventListener("click", function () {
        fmMpcEl.value = "0.8";
        fmMpiEl.value = "0.2";
        fmKEl.value = "1";
        fmImpulseEl.value = "10";
        setFmMode("closed");
      });
    }
  }

  /* Velocity of money calculator (classroom quantity theory) */
  var velocityCalcBtn = document.getElementById("calc-velocity");
  if (velocityCalcBtn) {
    var vomMEl = document.getElementById("vom-m");
    var vomPEl = document.getElementById("vom-p");
    var vomYEl = document.getElementById("vom-y");
    var vomVEl = document.getElementById("vom-v");
    var vomNominalEl = document.getElementById("vom-nominal");
    var vomMFields = document.getElementById("vom-m-fields");
    var vomPFields = document.getElementById("vom-p-fields");
    var vomYFields = document.getElementById("vom-y-fields");
    var vomVFields = document.getElementById("vom-v-fields");
    var vomNominalFields = document.getElementById("vom-nominal-fields");
    var vomModeHint = document.getElementById("vom-mode-hint");
    var vomModeVelocityBtn = document.getElementById("vom-mode-velocity");
    var vomModeNominalBtn = document.getElementById("vom-mode-nominal");
    var vomModeMoneyBtn = document.getElementById("vom-mode-money");
    var vomResultEl = document.getElementById("calc-velocity-result");
    var vomPrimaryLabel = document.getElementById("vom-primary-label");
    var vomPrimaryAmount = document.getElementById("vom-primary-amount");
    var vomPrimaryDetail = document.getElementById("vom-primary-detail");
    var vomIdentity = document.getElementById("vom-identity");
    var vomReadNote = document.getElementById("vom-read-note");
    var vomArithmetic = document.getElementById("vom-arithmetic");
    var vomSummary = document.getElementById("vom-summary");
    var vomErrorEl = document.getElementById("calc-velocity-error");
    var vomResetBtn = document.getElementById("calc-velocity-reset");
    var vomMode = "velocity";
    var vomModeButtons = [vomModeVelocityBtn, vomModeNominalBtn, vomModeMoneyBtn];
    var vomMin = 0.0001;
    var vomMax = 1000000000000;
    var vomInputs = [vomMEl, vomPEl, vomYEl, vomVEl, vomNominalEl];

    function showVomError(msg) {
      vomErrorEl.textContent = msg;
      vomErrorEl.classList.add("visible");
      vomResultEl.classList.remove("visible");
    }
    function clearVomError() {
      vomErrorEl.classList.remove("visible");
      vomErrorEl.textContent = "";
    }
    function hideVomResult() {
      vomResultEl.classList.remove("visible");
      clearVomError();
    }
    function formatVomAbs(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatVomPlain(n) {
      var rounded = Math.round(n * 10000) / 10000;
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4
      });
    }
    function vomRangeMessage(noun) {
      return "Enter " + noun + " of at least 0.0001 and up to 1,000,000,000,000.";
    }
    function readVomPositive(el, noun) {
      var raw = String(el.value).trim();
      if (raw === "") {
        return { ok: false, message: vomRangeMessage(noun) };
      }
      var n = parseFloat(raw);
      if (!isFinite(n) || n < vomMin || n > vomMax) {
        return { ok: false, message: vomRangeMessage(noun) };
      }
      return { ok: true, value: n };
    }
    function vomTooSmall(n) {
      return !(n > 0) || Math.round(n * 100) / 100 === 0;
    }
    function setVomMode(mode) {
      vomMode = mode;
      vomMFields.hidden = mode === "money";
      vomPFields.hidden = mode !== "velocity";
      vomYFields.hidden = mode !== "velocity";
      vomVFields.hidden = mode === "velocity";
      vomNominalFields.hidden = mode !== "money";
      var activeBtn = vomModeVelocityBtn;
      var hint = "Solve for velocity. Nominal GDP equals the price level times real output. Velocity equals that nominal GDP divided by money.";
      if (mode === "nominal") {
        activeBtn = vomModeNominalBtn;
        hint = "Solve for nominal GDP. Nominal GDP equals money times velocity. This mode does not ask for a separate price level or real output.";
      } else if (mode === "money") {
        activeBtn = vomModeMoneyBtn;
        hint = "Solve for money. Money equals nominal GDP divided by velocity.";
      }
      var i;
      for (i = 0; i < vomModeButtons.length; i++) {
        var on = vomModeButtons[i] === activeBtn;
        vomModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        vomModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      vomModeHint.textContent = hint;
      hideVomResult();
    }

    vomModeVelocityBtn.addEventListener("click", function () {
      setVomMode("velocity");
    });
    vomModeNominalBtn.addEventListener("click", function () {
      setVomMode("nominal");
    });
    vomModeMoneyBtn.addEventListener("click", function () {
      setVomMode("money");
    });
    for (var vomInputIndex = 0; vomInputIndex < vomInputs.length; vomInputIndex++) {
      vomInputs[vomInputIndex].addEventListener("input", hideVomResult);
    }

    velocityCalcBtn.addEventListener("click", function () {
      clearVomError();
      var m = null;
      var p = null;
      var y = null;
      var v = null;
      var nominal = null;
      var primary;
      var primaryLabel;
      var primaryDetail;
      var arithmetic;
      var identity;
      var readNote;
      var summary;

      if (vomMode === "velocity") {
        var typedM = readVomPositive(vomMEl, "a money stock");
        if (!typedM.ok) {
          showVomError(typedM.message);
          return;
        }
        var typedP = readVomPositive(vomPEl, "a price level or GDP deflator index");
        if (!typedP.ok) {
          showVomError(typedP.message);
          return;
        }
        var typedY = readVomPositive(vomYEl, "real output");
        if (!typedY.ok) {
          showVomError(typedY.message);
          return;
        }
        m = typedM.value;
        p = typedP.value;
        y = typedY.value;
        nominal = p * y;
        if (!isFinite(nominal) || nominal > vomMax) {
          showVomError("Those inputs imply a nominal GDP this classroom display cannot show. Use a smaller price level or smaller real output.");
          return;
        }
        if (vomTooSmall(nominal)) {
          showVomError("Those inputs imply a nominal GDP below 0.01, which this classroom display rounds to zero. Use larger numbers.");
          return;
        }
        v = nominal / m;
        if (!isFinite(v) || v > vomMax) {
          showVomError("Those inputs imply a velocity this classroom display cannot show. Use a larger money stock or a smaller nominal GDP.");
          return;
        }
        if (vomTooSmall(v)) {
          showVomError("Those inputs imply a velocity below 0.01, which this classroom display rounds to zero. Use a smaller money stock or a larger nominal GDP.");
          return;
        }
        primary = v;
        primaryLabel = "Velocity";
        primaryDetail = "Equals nominal GDP divided by money. Nominal GDP is the price level times real output.";
        arithmetic =
          "Price level times real output is " + formatVomPlain(p) +
          " times " + formatVomPlain(y) +
          ", which is " + formatVomAbs(nominal) +
          ". Velocity equals " + formatVomAbs(nominal) +
          " divided by " + formatVomPlain(m) +
          ", which is " + formatVomAbs(v) + ".";
        identity =
          formatVomPlain(m) + " times " + formatVomAbs(v) +
          " equals " + formatVomPlain(p) + " times " + formatVomPlain(y) +
          ". Both sides equal " + formatVomAbs(nominal) + ".";
        readNote =
          "Velocity is " + formatVomAbs(v) +
          ". Each unit of money lines up with " + formatVomAbs(v) +
          " units of nominal GDP in this sketch. Nominal GDP is " + formatVomAbs(nominal) + ". ";
        if (p >= 10 || p < 0.2) {
          readNote +=
            "The price figure is " + formatVomAbs(p) +
            ". If that is a deflator index rather than a price level near 1, this velocity is not comparable with the EXAMPLE that uses a price level of 1. ";
        }
        readNote +=
          "Velocity is not constant. A short run change in money need not show up one for one in prices, because velocity and real output can move. M1 and M2 imply different velocities, and UK and US aggregates differ. These are numbers you typed, not an official series.";
        summary =
          "Money " + formatVomPlain(m) +
          ". Price level " + formatVomPlain(p) +
          ". Real output " + formatVomPlain(y) +
          ". Nominal GDP " + formatVomAbs(nominal) +
          ". Velocity " + formatVomAbs(v) +
          ". Educational estimate only. Not a forecast and not investment advice.";
      } else if (vomMode === "nominal") {
        var typedMoney = readVomPositive(vomMEl, "a money stock");
        if (!typedMoney.ok) {
          showVomError(typedMoney.message);
          return;
        }
        var typedV = readVomPositive(vomVEl, "a velocity");
        if (!typedV.ok) {
          showVomError(typedV.message);
          return;
        }
        m = typedMoney.value;
        v = typedV.value;
        nominal = m * v;
        if (!isFinite(nominal) || nominal > vomMax) {
          showVomError("Those inputs imply a nominal GDP this classroom display cannot show. Use a smaller money stock or a smaller velocity.");
          return;
        }
        if (vomTooSmall(nominal)) {
          showVomError("Those inputs imply a nominal GDP below 0.01, which this classroom display rounds to zero. Use larger numbers.");
          return;
        }
        primary = nominal;
        primaryLabel = "Nominal GDP";
        primaryDetail = "Equals money times velocity. This mode does not split the product into a price level and real output.";
        arithmetic =
          "Nominal GDP equals " + formatVomPlain(m) +
          " times " + formatVomPlain(v) +
          ", which is " + formatVomAbs(nominal) + ".";
        identity =
          formatVomPlain(m) + " times " + formatVomPlain(v) +
          " equals " + formatVomAbs(nominal) +
          ". That product is nominal GDP.";
        readNote =
          "Nominal GDP is " + formatVomAbs(nominal) +
          ". It equals money times velocity in this sketch. The page does not split that product into prices and real output. Velocity is not constant, so this is not a forecast of spending. The definition of money still matters if you later compare the result with M1 or M2. These are numbers you typed, not an official series.";
        summary =
          "Money " + formatVomPlain(m) +
          ". Velocity " + formatVomPlain(v) +
          ". Nominal GDP " + formatVomAbs(nominal) +
          ". Educational estimate only. Not a forecast and not investment advice.";
      } else {
        var typedVelocity = readVomPositive(vomVEl, "a velocity");
        if (!typedVelocity.ok) {
          showVomError(typedVelocity.message);
          return;
        }
        var typedNominal = readVomPositive(vomNominalEl, "nominal GDP");
        if (!typedNominal.ok) {
          showVomError(typedNominal.message);
          return;
        }
        v = typedVelocity.value;
        nominal = typedNominal.value;
        m = nominal / v;
        if (!isFinite(m) || m > vomMax) {
          showVomError("Those inputs imply a money stock this classroom display cannot show. Use a smaller nominal GDP or a larger velocity.");
          return;
        }
        if (vomTooSmall(m)) {
          showVomError("Those inputs imply a money stock below 0.01, which this classroom display rounds to zero. Use a larger nominal GDP or a smaller velocity.");
          return;
        }
        primary = m;
        primaryLabel = "Money";
        primaryDetail = "Equals nominal GDP divided by velocity.";
        arithmetic =
          "Money equals " + formatVomPlain(nominal) +
          " divided by " + formatVomPlain(v) +
          ", which is " + formatVomAbs(m) + ".";
        identity =
          formatVomAbs(m) + " times " + formatVomPlain(v) +
          " equals " + formatVomPlain(nominal) +
          ". Money is nominal GDP divided by velocity.";
        readNote =
          "Money is " + formatVomAbs(m) +
          ". It equals nominal GDP divided by velocity in this sketch. A different velocity, or a different definition of money such as M1 or M2, would change this result. UK and US aggregates differ. These are numbers you typed, not an official money stock.";
        summary =
          "Velocity " + formatVomPlain(v) +
          ". Nominal GDP " + formatVomPlain(nominal) +
          ". Money " + formatVomAbs(m) +
          ". Educational estimate only. Not a forecast and not investment advice.";
      }

      arithmetic += " Shown to two decimal places.";
      vomPrimaryLabel.textContent = primaryLabel;
      vomPrimaryAmount.textContent = formatVomAbs(primary);
      vomPrimaryDetail.textContent = primaryDetail;
      vomIdentity.textContent = identity;
      vomReadNote.textContent = readNote;
      vomArithmetic.textContent = arithmetic;
      vomSummary.textContent = summary;
      vomResultEl.classList.add("visible");
    });

    if (vomResetBtn) {
      vomResetBtn.addEventListener("click", function () {
        vomMEl.value = "100";
        vomPEl.value = "1";
        vomYEl.value = "500";
        vomVEl.value = "5";
        vomNominalEl.value = "500";
        setVomMode("velocity");
      });
    }
  }

  /* GDP deflator calculator (nominal, real, and the implicit price deflator) */
  var gdpDeflatorCalcBtn = document.getElementById("calc-gdp-deflator");
  if (gdpDeflatorCalcBtn) {
    var gdNominalEl = document.getElementById("gd-nominal");
    var gdRealEl = document.getElementById("gd-real");
    var gdDeflatorEl = document.getElementById("gd-deflator");
    var gdD1El = document.getElementById("gd-d1");
    var gdD2El = document.getElementById("gd-d2");
    var gdNominalFields = document.getElementById("gd-nominal-fields");
    var gdRealFields = document.getElementById("gd-real-fields");
    var gdDeflatorFields = document.getElementById("gd-deflator-fields");
    var gdD1Fields = document.getElementById("gd-d1-fields");
    var gdD2Fields = document.getElementById("gd-d2-fields");
    var gdModeHint = document.getElementById("gd-mode-hint");
    var gdModeDeflatorBtn = document.getElementById("gd-mode-deflator");
    var gdModeRealBtn = document.getElementById("gd-mode-real");
    var gdModeNominalBtn = document.getElementById("gd-mode-nominal");
    var gdModeInflationBtn = document.getElementById("gd-mode-inflation");
    var gdResultEl = document.getElementById("calc-gdp-deflator-result");
    var gdPrimaryLabel = document.getElementById("gd-primary-label");
    var gdPrimaryAmount = document.getElementById("gd-primary-amount");
    var gdPrimaryDetail = document.getElementById("gd-primary-detail");
    var gdIdentity = document.getElementById("gd-identity");
    var gdReadNote = document.getElementById("gd-read-note");
    var gdArithmetic = document.getElementById("gd-arithmetic");
    var gdSummary = document.getElementById("gd-summary");
    var gdErrorEl = document.getElementById("calc-gdp-deflator-error");
    var gdResetBtn = document.getElementById("calc-gdp-deflator-reset");
    var gdMode = "deflator";
    var gdModeButtons = [gdModeDeflatorBtn, gdModeRealBtn, gdModeNominalBtn, gdModeInflationBtn];
    var gdLevelMin = 0.0001;
    var gdLevelMax = 1000000000000000;
    var gdIndexMax = 1000000;
    var gdInputs = [gdNominalEl, gdRealEl, gdDeflatorEl, gdD1El, gdD2El];

    function showGdError(msg) {
      gdErrorEl.textContent = msg;
      gdErrorEl.classList.add("visible");
      gdResultEl.classList.remove("visible");
    }
    function clearGdError() {
      gdErrorEl.classList.remove("visible");
      gdErrorEl.textContent = "";
    }
    function hideGdResult() {
      gdResultEl.classList.remove("visible");
      clearGdError();
    }
    function formatGdAbs(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatGdPlain(n) {
      var rounded = Math.round(n * 10000) / 10000;
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4
      });
    }
    function formatGdLevel(n) {
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function gdTooSmall(n) {
      return !(n > 0) || Math.round(n * 100) / 100 === 0;
    }
    function gdPlainWords(n) {
      var abs = formatGdPlain(Math.abs(n));
      if (n < -0.0000001) return "minus " + abs;
      return abs;
    }
    function gdSignedWords(n) {
      var abs = formatGdAbs(n);
      if (n < -0.0000001) return "minus " + abs;
      return abs;
    }
    function gdLevelMessage(noun) {
      return "Enter " + noun + " of at least 0.0001 and up to 1,000,000,000,000,000.";
    }
    function gdIndexMessage(noun) {
      return "Enter " + noun + " of at least 0.0001 and up to 1,000,000. Zero does not work, because the identity divides by the index.";
    }
    function readGdLevel(el, noun) {
      var raw = String(el.value).trim();
      if (raw === "") {
        return { ok: false, message: gdLevelMessage(noun) };
      }
      var n = parseFloat(raw);
      if (!isFinite(n) || n < gdLevelMin || n > gdLevelMax) {
        return { ok: false, message: gdLevelMessage(noun) };
      }
      return { ok: true, value: n };
    }
    function readGdIndex(el, noun) {
      var raw = String(el.value).trim();
      if (raw === "") {
        return { ok: false, message: gdIndexMessage(noun) };
      }
      var n = parseFloat(raw);
      if (!isFinite(n) || n < gdLevelMin || n > gdIndexMax) {
        return { ok: false, message: gdIndexMessage(noun) };
      }
      return { ok: true, value: n };
    }
    function gdBaseNote(deflator) {
      var gap = deflator - 100;
      if (Math.abs(gap) < 0.005) {
        return "The deflator is about 100. In the textbook setup, that means prices match the index base, so nominal GDP and real GDP are about equal. If the series you copied uses another base, read the result as an index level only. ";
      }
      if (gap > 0) {
        return "Relative to an index of 100, this deflator is " + formatGdAbs(gap) +
          " percent higher. That percent assumes the base is 100. If the series you copied uses another base, read the result as an index level only. ";
      }
      return "Relative to an index of 100, this deflator is " + formatGdAbs(gap) +
        " percent lower. That percent assumes the base is 100. If the series you copied uses another base, read the result as an index level only. ";
    }
    function setGdMode(mode) {
      gdMode = mode;
      gdNominalFields.hidden = mode === "nominal" || mode === "inflation";
      gdRealFields.hidden = mode === "real" || mode === "inflation";
      gdDeflatorFields.hidden = mode === "deflator" || mode === "inflation";
      gdD1Fields.hidden = mode !== "inflation";
      gdD2Fields.hidden = mode !== "inflation";
      var activeBtn = gdModeDeflatorBtn;
      var hint = "Solve for the GDP deflator. The deflator equals nominal GDP divided by real GDP, times 100.";
      if (mode === "real") {
        activeBtn = gdModeRealBtn;
        hint = "Solve for real GDP. Real GDP equals nominal GDP divided by the deflator over 100.";
      } else if (mode === "nominal") {
        activeBtn = gdModeNominalBtn;
        hint = "Solve for nominal GDP. Nominal GDP equals real GDP times the deflator over 100.";
      } else if (mode === "inflation") {
        activeBtn = gdModeInflationBtn;
        hint = "Inflation between two periods. The percent change equals the later deflator divided by the earlier deflator, minus 1, times 100.";
      }
      var i;
      for (i = 0; i < gdModeButtons.length; i++) {
        var on = gdModeButtons[i] === activeBtn;
        gdModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        gdModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      gdModeHint.textContent = hint;
      hideGdResult();
    }

    gdModeDeflatorBtn.addEventListener("click", function () {
      setGdMode("deflator");
    });
    gdModeRealBtn.addEventListener("click", function () {
      setGdMode("real");
    });
    gdModeNominalBtn.addEventListener("click", function () {
      setGdMode("nominal");
    });
    gdModeInflationBtn.addEventListener("click", function () {
      setGdMode("inflation");
    });
    for (var gdInputIndex = 0; gdInputIndex < gdInputs.length; gdInputIndex++) {
      gdInputs[gdInputIndex].addEventListener("input", hideGdResult);
    }

    gdpDeflatorCalcBtn.addEventListener("click", function () {
      clearGdError();
      var nominal = null;
      var real = null;
      var deflator = null;
      var earlier = null;
      var later = null;
      var ratio = null;
      var primary;
      var primaryLabel;
      var primaryAmount;
      var primaryDetail;
      var arithmetic;
      var identity;
      var readNote;
      var summary;

      if (gdMode === "deflator") {
        var typedNominal = readGdLevel(gdNominalEl, "nominal GDP");
        if (!typedNominal.ok) {
          showGdError(typedNominal.message);
          return;
        }
        var typedReal = readGdLevel(gdRealEl, "real GDP");
        if (!typedReal.ok) {
          showGdError(typedReal.message);
          return;
        }
        nominal = typedNominal.value;
        real = typedReal.value;
        deflator = (nominal / real) * 100;
        if (!isFinite(deflator) || deflator > gdIndexMax) {
          showGdError("Those inputs imply a deflator this classroom display cannot show. Use a larger real GDP or a smaller nominal GDP.");
          return;
        }
        if (gdTooSmall(deflator)) {
          showGdError("Those inputs imply a deflator below 0.01, which this classroom display rounds to zero. Use a larger nominal GDP or a smaller real GDP.");
          return;
        }
        ratio = deflator / 100;
        primary = deflator;
        primaryLabel = "GDP deflator";
        primaryAmount = formatGdAbs(deflator);
        primaryDetail = "Index. Equals nominal GDP divided by real GDP, times 100.";
        arithmetic =
          "Nominal GDP divided by real GDP is " + formatGdLevel(nominal) +
          " divided by " + formatGdLevel(real) +
          ", which is " + formatGdPlain(ratio) +
          ". Times 100, the deflator is " + formatGdAbs(deflator) + ".";
        identity =
          formatGdLevel(nominal) + " divided by " + formatGdLevel(real) +
          ", times 100, equals " + formatGdAbs(deflator) + ".";
        readNote =
          "The deflator is " + formatGdAbs(deflator) + ". " + gdBaseNote(deflator) +
          "Real GDP is the volume. Nominal GDP is the current price value. These are numbers you typed, not a BEA or ONS release.";
        summary =
          "Nominal GDP " + formatGdLevel(nominal) +
          ". Real GDP " + formatGdLevel(real) +
          ". GDP deflator " + formatGdAbs(deflator) +
          ". Educational estimate only. Not a forecast and not investment advice.";
      } else if (gdMode === "real") {
        var typedNominalForReal = readGdLevel(gdNominalEl, "nominal GDP");
        if (!typedNominalForReal.ok) {
          showGdError(typedNominalForReal.message);
          return;
        }
        var typedDeflator = readGdIndex(gdDeflatorEl, "a GDP deflator index");
        if (!typedDeflator.ok) {
          showGdError(typedDeflator.message);
          return;
        }
        nominal = typedNominalForReal.value;
        deflator = typedDeflator.value;
        ratio = deflator / 100;
        real = nominal / ratio;
        if (!isFinite(real) || real > gdLevelMax) {
          showGdError("Those inputs imply a real GDP this classroom display cannot show. Use a smaller nominal GDP or a larger deflator.");
          return;
        }
        if (gdTooSmall(real)) {
          showGdError("Those inputs imply a real GDP below 0.01, which this classroom display rounds to zero. Use a larger nominal GDP or a smaller deflator.");
          return;
        }
        primary = real;
        primaryLabel = "Real GDP";
        primaryAmount = formatGdAbs(real);
        primaryDetail = "Equals nominal GDP divided by the deflator over 100. Same units as the nominal GDP you typed.";
        arithmetic =
          "The deflator divided by 100 is " + formatGdAbs(deflator) +
          " divided by 100, which is " + formatGdPlain(ratio) +
          ". Real GDP equals " + formatGdLevel(nominal) +
          " divided by " + formatGdPlain(ratio) +
          ", which is " + formatGdAbs(real) + ".";
        identity =
          formatGdLevel(real) + " times " + formatGdPlain(ratio) +
          " equals " + formatGdLevel(nominal) +
          ". Real GDP is nominal GDP divided by the deflator over 100.";
        readNote =
          "Real GDP is " + formatGdAbs(real) +
          ". A higher deflator means a smaller real GDP for the same nominal GDP. " +
          gdBaseNote(deflator) +
          "These are numbers you typed, not an official real GDP figure.";
        summary =
          "Nominal GDP " + formatGdLevel(nominal) +
          ". GDP deflator " + formatGdAbs(deflator) +
          ". Real GDP " + formatGdAbs(real) +
          ". Educational estimate only. Not a forecast and not investment advice.";
      } else if (gdMode === "nominal") {
        var typedRealForNominal = readGdLevel(gdRealEl, "real GDP");
        if (!typedRealForNominal.ok) {
          showGdError(typedRealForNominal.message);
          return;
        }
        var typedDeflatorForNominal = readGdIndex(gdDeflatorEl, "a GDP deflator index");
        if (!typedDeflatorForNominal.ok) {
          showGdError(typedDeflatorForNominal.message);
          return;
        }
        real = typedRealForNominal.value;
        deflator = typedDeflatorForNominal.value;
        ratio = deflator / 100;
        nominal = real * ratio;
        if (!isFinite(nominal) || nominal > gdLevelMax) {
          showGdError("Those inputs imply a nominal GDP this classroom display cannot show. Use a smaller real GDP or a smaller deflator.");
          return;
        }
        if (gdTooSmall(nominal)) {
          showGdError("Those inputs imply a nominal GDP below 0.01, which this classroom display rounds to zero. Use a larger real GDP or a larger deflator.");
          return;
        }
        primary = nominal;
        primaryLabel = "Nominal GDP";
        primaryAmount = formatGdAbs(nominal);
        primaryDetail = "Equals real GDP times the deflator over 100. Same units as the real GDP you typed.";
        arithmetic =
          "The deflator divided by 100 is " + formatGdAbs(deflator) +
          " divided by 100, which is " + formatGdPlain(ratio) +
          ". Nominal GDP equals " + formatGdLevel(real) +
          " times " + formatGdPlain(ratio) +
          ", which is " + formatGdAbs(nominal) + ".";
        identity =
          formatGdLevel(real) + " times (" + formatGdAbs(deflator) +
          " divided by 100) equals " + formatGdLevel(nominal) + ".";
        readNote =
          "Nominal GDP is " + formatGdAbs(nominal) +
          ". A higher deflator means a larger nominal GDP for the same real GDP. " +
          gdBaseNote(deflator) +
          "These are numbers you typed, not an official nominal GDP figure.";
        summary =
          "Real GDP " + formatGdLevel(real) +
          ". GDP deflator " + formatGdAbs(deflator) +
          ". Nominal GDP " + formatGdAbs(nominal) +
          ". Educational estimate only. Not a forecast and not investment advice.";
      } else {
        var typedEarlier = readGdIndex(gdD1El, "an earlier deflator index");
        if (!typedEarlier.ok) {
          showGdError(typedEarlier.message);
          return;
        }
        var typedLater = readGdIndex(gdD2El, "a later deflator index");
        if (!typedLater.ok) {
          showGdError(typedLater.message);
          return;
        }
        earlier = typedEarlier.value;
        later = typedLater.value;
        ratio = later / earlier;
        var inflation = (ratio - 1) * 100;
        if (!isFinite(inflation) || Math.abs(inflation) > gdIndexMax) {
          showGdError("Those indexes imply a percent change this classroom display cannot show. Use indexes that are closer together.");
          return;
        }
        primary = inflation;
        primaryLabel = "Deflator inflation";
        primaryAmount = (inflation < -0.0000001 ? "\u2212" : "") + formatGdAbs(inflation) + "%";
        primaryDetail = "Percent change from the earlier index to the later index. Not annualised, and not a consumer price index.";
        arithmetic =
          "The later deflator divided by the earlier deflator is " + formatGdLevel(later) +
          " divided by " + formatGdLevel(earlier) +
          ", which is " + formatGdPlain(ratio) +
          ". Subtract 1, and that difference is " + gdPlainWords(ratio - 1) +
          ". Times 100, the percent change is " + gdSignedWords(inflation) + " percent.";
        identity =
          "((" + formatGdLevel(later) + " divided by " + formatGdLevel(earlier) +
          ") minus 1) times 100 equals " + gdSignedWords(inflation) + " percent.";
        if (inflation > 0.005) {
          readNote =
            "The later index is higher. The percent change is " + formatGdAbs(inflation) +
            " percent. This is the inflation rate of the deflator between the two periods you typed. It is not annualised. It is not CPI, and it is not PCE. ";
        } else if (inflation < -0.005) {
          readNote =
            "The later index is lower. The percent change is minus " + formatGdAbs(inflation) +
            " percent, a fall in the deflator. This is not a forecast. It is not CPI, and it is not PCE. ";
        } else {
          readNote =
            "The two indexes match, or the gap rounds to zero at two decimal places, so the percent change is about zero. ";
        }
        readNote +=
          "Match the base and the seasonal treatment before you compare two official indexes. These are numbers you typed.";
        summary =
          "Earlier deflator " + formatGdLevel(earlier) +
          ". Later deflator " + formatGdLevel(later) +
          ". Percent change " + gdSignedWords(inflation) +
          " percent. Educational estimate only. Not a forecast and not investment advice.";
      }

      arithmetic += " Shown to two decimal places.";
      gdPrimaryLabel.textContent = primaryLabel;
      gdPrimaryAmount.textContent = primaryAmount;
      gdPrimaryDetail.textContent = primaryDetail;
      gdIdentity.textContent = identity;
      gdReadNote.textContent = readNote;
      gdArithmetic.textContent = arithmetic;
      gdSummary.textContent = summary;
      gdResultEl.classList.add("visible");
    });

    if (gdResetBtn) {
      gdResetBtn.addEventListener("click", function () {
        gdNominalEl.value = "1100";
        gdRealEl.value = "1000";
        gdDeflatorEl.value = "110";
        gdD1El.value = "100";
        gdD2El.value = "110";
        setGdMode("deflator");
      });
    }
  }

  /* Purchasing power parity and real exchange rate calculator */
  var pppCalcBtn = document.getElementById("calc-ppp");
  if (pppCalcBtn) {
    var pppPriceAEl = document.getElementById("ppp-price-a");
    var pppPriceBEl = document.getElementById("ppp-price-b");
    var pppMarketEl = document.getElementById("ppp-market");
    var pppEEl = document.getElementById("ppp-e");
    var pppPdEl = document.getElementById("ppp-pd");
    var pppPfEl = document.getElementById("ppp-pf");
    var pppPriceAFields = document.getElementById("ppp-price-a-fields");
    var pppPriceBFields = document.getElementById("ppp-price-b-fields");
    var pppMarketFields = document.getElementById("ppp-market-fields");
    var pppEFields = document.getElementById("ppp-e-fields");
    var pppPdFields = document.getElementById("ppp-pd-fields");
    var pppPfFields = document.getElementById("ppp-pf-fields");
    var pppModeHint = document.getElementById("ppp-mode-hint");
    var pppModeAbsoluteBtn = document.getElementById("ppp-mode-absolute");
    var pppModeGapBtn = document.getElementById("ppp-mode-gap");
    var pppModeRerBtn = document.getElementById("ppp-mode-rer");
    var pppResultEl = document.getElementById("calc-ppp-result");
    var pppPrimaryLabel = document.getElementById("ppp-primary-label");
    var pppPrimaryAmount = document.getElementById("ppp-primary-amount");
    var pppPrimaryDetail = document.getElementById("ppp-primary-detail");
    var pppSecondLabel = document.getElementById("ppp-second-label");
    var pppSecondAmount = document.getElementById("ppp-second-amount");
    var pppSecondDetail = document.getElementById("ppp-second-detail");
    var pppPlainEl = document.getElementById("ppp-label");
    var pppQuoteEl = document.getElementById("ppp-quote");
    var pppReadNote = document.getElementById("ppp-read-note");
    var pppArithmetic = document.getElementById("ppp-arithmetic");
    var pppSummary = document.getElementById("ppp-summary");
    var pppErrorEl = document.getElementById("calc-ppp-error");
    var pppResetBtn = document.getElementById("calc-ppp-reset");
    var pppMode = "absolute";
    var pppModeButtons = [pppModeAbsoluteBtn, pppModeGapBtn, pppModeRerBtn];
    var pppInputs = [pppPriceAEl, pppPriceBEl, pppMarketEl, pppEEl, pppPdEl, pppPfEl];
    var pppLevelMin = 0.0001;
    var pppLevelMax = 1000000000000000;
    var pppRateMax = 1000000000000;
    var pppGapMax = 1000000;

    function showPppError(msg) {
      pppErrorEl.textContent = msg;
      pppErrorEl.classList.add("visible");
      pppResultEl.classList.remove("visible");
    }
    function clearPppError() {
      pppErrorEl.classList.remove("visible");
      pppErrorEl.textContent = "";
    }
    function hidePppResult() {
      pppResultEl.classList.remove("visible");
      clearPppError();
    }
    function formatPpp(n) {
      return Math.abs(n).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatPppPlain(n) {
      var rounded = Math.round(Math.abs(n) * 10000) / 10000;
      var text = rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4
      });
      if (n < -0.0000001) return "minus " + text;
      return text;
    }
    function roundPpp2(n) {
      return Math.round(n * 100) / 100;
    }
    function pppTooSmall(n) {
      return !(n > 0) || roundPpp2(n) === 0;
    }
    function pppLevelMessage(noun) {
      return "Enter " + noun + " of at least 0.0001 and up to 1,000,000,000,000,000.";
    }
    function readPppLevel(el, noun) {
      var raw = String(el.value).trim();
      if (raw === "") {
        return { ok: false, message: pppLevelMessage(noun) };
      }
      var n = parseFloat(raw);
      if (!isFinite(n) || n < pppLevelMin || n > pppLevelMax) {
        return { ok: false, message: pppLevelMessage(noun) };
      }
      return { ok: true, value: n };
    }
    function pppRateOverflow(noun) {
      return "Those inputs imply " + noun + " this classroom display cannot show. Use numbers that are closer together.";
    }
    function setPppMode(mode) {
      pppMode = mode;
      pppPriceAFields.hidden = mode === "rer";
      pppPriceBFields.hidden = mode === "rer";
      pppMarketFields.hidden = mode !== "gap";
      pppEFields.hidden = mode !== "rer";
      pppPdFields.hidden = mode !== "rer";
      pppPfFields.hidden = mode !== "rer";
      var activeBtn = pppModeAbsoluteBtn;
      var hint = "Absolute PPP. The PPP rate equals the basket price in currency A divided by the basket price in currency B. The result is units of A per 1 unit of B.";
      if (mode === "gap") {
        activeBtn = pppModeGapBtn;
        hint = "Market versus PPP. Both rates are units of A per 1 unit of B. The percent gap equals ((market minus PPP) divided by PPP) times 100. Above PPP, currency B looks overvalued versus the basket. Below PPP, currency B looks undervalued versus the basket.";
      } else if (mode === "rer") {
        activeBtn = pppModeRerBtn;
        hint = "Real exchange rate. E is domestic currency per 1 unit of foreign currency. RER equals E times the foreign price index divided by the domestic price index. The PPP implied E equals the domestic index divided by the foreign index. RER near 1 means absolute PPP holds for those indexes.";
      }
      var i;
      for (i = 0; i < pppModeButtons.length; i++) {
        var on = pppModeButtons[i] === activeBtn;
        pppModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        pppModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      pppModeHint.textContent = hint;
      hidePppResult();
    }

    pppModeAbsoluteBtn.addEventListener("click", function () {
      setPppMode("absolute");
    });
    pppModeGapBtn.addEventListener("click", function () {
      setPppMode("gap");
    });
    pppModeRerBtn.addEventListener("click", function () {
      setPppMode("rer");
    });
    for (var pppInputIndex = 0; pppInputIndex < pppInputs.length; pppInputIndex++) {
      pppInputs[pppInputIndex].addEventListener("input", hidePppResult);
    }

    pppCalcBtn.addEventListener("click", function () {
      clearPppError();
      var priceA;
      var priceB;
      var market;
      var nominalE;
      var domesticP;
      var foreignP;
      var pppRate;
      var inverse;
      var gap;
      var rer;
      var impliedE;
      var primaryLabel;
      var primaryAmount;
      var primaryDetail;
      var secondLabel;
      var secondAmount;
      var secondDetail;
      var plain;
      var quote;
      var readNote;
      var arithmetic;
      var summary;
      var advice = " Educational estimate only. Not a forecast, not investment advice, and not foreign exchange trading advice.";

      if (pppMode === "absolute" || pppMode === "gap") {
        var typedA = readPppLevel(pppPriceAEl, "a basket price in currency A");
        if (!typedA.ok) {
          showPppError(typedA.message);
          return;
        }
        var typedB = readPppLevel(pppPriceBEl, "a basket price in currency B");
        if (!typedB.ok) {
          showPppError(typedB.message);
          return;
        }
        priceA = typedA.value;
        priceB = typedB.value;
        pppRate = priceA / priceB;
        inverse = priceB / priceA;
        if (!isFinite(pppRate) || pppRate > pppRateMax || !isFinite(inverse) || inverse > pppRateMax) {
          showPppError(pppRateOverflow("a PPP rate"));
          return;
        }
        if (pppTooSmall(pppRate) || pppTooSmall(inverse)) {
          showPppError("Those inputs imply a PPP rate below 0.01, which this classroom display rounds to zero. Use basket prices that are closer together.");
          return;
        }
      }

      if (pppMode === "absolute") {
        var pppShow = roundPpp2(pppRate);
        var inverseShow = roundPpp2(inverse);
        primaryLabel = "PPP exchange rate";
        primaryAmount = formatPpp(pppShow);
        primaryDetail = "Units of currency A per 1 unit of currency B. Equals the basket price in A divided by the basket price in B.";
        secondLabel = "Inverse rate";
        secondAmount = formatPpp(inverseShow);
        secondDetail = "Units of currency B per 1 unit of currency A. Equals the basket price in B divided by the basket price in A.";
        plain =
          "One unit of currency B lines up with " + formatPpp(pppShow) +
          " units of currency A for this basket. That is absolute PPP for these two prices. The inverse is " +
          formatPpp(inverseShow) +
          " units of currency B per 1 unit of currency A. This is not a market rate and not a forecast.";
        quote =
          "This page quotes the PPP rate as units of currency A per 1 unit of currency B. A higher number means one unit of B costs more units of A. The inverse runs the other way. In the EXAMPLE, currency A stands in for the dollar and currency B stands in for the pound. If your currencies differ, keep A and B as you defined them.";
        readNote =
          "Absolute PPP here is one identical basket, not a World Bank or OECD PPP factor. A market rate can sit away from this rate for years, because many goods are hard to trade and financial flows move the spot rate. These are numbers you typed, not an official series.";
        arithmetic =
          "The basket price in currency A divided by the basket price in currency B is " + formatPpp(priceA) +
          " divided by " + formatPpp(priceB) +
          ", which is " + formatPppPlain(pppRate) +
          ". That is the PPP rate in units of A per 1 unit of B. The inverse is " + formatPpp(priceB) +
          " divided by " + formatPpp(priceA) +
          ", which is " + formatPppPlain(inverse) +
          " units of B per 1 unit of A.";
        summary =
          "Basket price in A " + formatPpp(priceA) +
          ". Basket price in B " + formatPpp(priceB) +
          ". PPP rate " + formatPpp(pppShow) +
          " units of A per 1 unit of B. Inverse " + formatPpp(inverseShow) +
          " units of B per 1 unit of A." + advice;
      } else if (pppMode === "gap") {
        var typedMarket = readPppLevel(pppMarketEl, "a market rate in units of A per 1 unit of B");
        if (!typedMarket.ok) {
          showPppError(typedMarket.message);
          return;
        }
        market = typedMarket.value;
        gap = ((market - pppRate) / pppRate) * 100;
        if (!isFinite(gap) || Math.abs(gap) > pppGapMax) {
          showPppError("Those inputs imply a percent gap this classroom display cannot show. Use a market rate closer to the PPP rate.");
          return;
        }
        var pppShowGap = roundPpp2(pppRate);
        var gapShow = roundPpp2(gap);
        primaryLabel = "PPP exchange rate";
        primaryAmount = formatPpp(pppShowGap);
        primaryDetail = "Units of currency A per 1 unit of currency B. Equals the basket price in A divided by the basket price in B.";
        secondLabel = "Percent gap";
        secondAmount = (gapShow < 0 ? "\u2212" : "") + formatPpp(gapShow) + "%";
        secondDetail = "Equals ((market rate minus PPP rate) divided by PPP rate) times 100. Positive means the market rate sits above PPP.";
        if (gapShow > 0) {
          plain =
            "Currency B looks overvalued versus the basket. The market rate is " + formatPpp(market) +
            " and the PPP rate is " + formatPpp(pppShowGap) +
            ", so the market sits above PPP. Both rates are units of currency A per 1 unit of currency B, so one unit of B costs more units of A in the market than the basket prices imply.";
        } else if (gapShow < 0) {
          plain =
            "Currency B looks undervalued versus the basket. The market rate is " + formatPpp(market) +
            " and the PPP rate is " + formatPpp(pppShowGap) +
            ", so the market sits below PPP. Both rates are units of currency A per 1 unit of currency B, so one unit of B costs fewer units of A in the market than the basket prices imply.";
        } else {
          plain =
            "The market rate matches the PPP rate at two decimal places. On this basket, currency B does not look overvalued or undervalued. Both rates are units of currency A per 1 unit of currency B.";
        }
        quote =
          "The market rate and the PPP rate are both quoted as units of currency A per 1 unit of currency B. Do not enter the inverse quote in the market box. In the EXAMPLE, currency A stands in for the dollar and currency B stands in for the pound, so a market rate of 1.50 means 1.50 dollars per pound. A positive gap then means the pound looks overvalued versus that basket. If your A and B are different currencies, read the label as A and B.";
        readNote =
          "The gap is a description of these prices and this quote. It is not a forecast, not a valuation of a currency in the market, and not foreign exchange trading advice. Official PPP factors, including World Bank series PA.NUS.PPP, use a broad basket and a published quote. These are numbers you typed.";
        arithmetic =
          "The PPP rate is " + formatPpp(priceA) +
          " divided by " + formatPpp(priceB) +
          ", which is " + formatPppPlain(pppRate) +
          " units of A per 1 unit of B. The market rate minus the PPP rate is " + formatPpp(market) +
          " minus " + formatPppPlain(pppRate) +
          ", which is " + formatPppPlain(market - pppRate) +
          ". Divided by the PPP rate, that is " + formatPppPlain((market - pppRate) / pppRate) +
          ". Times 100, the percent gap is " + formatPppPlain(gap) + " percent.";
        summary =
          "Basket price in A " + formatPpp(priceA) +
          ". Basket price in B " + formatPpp(priceB) +
          ". PPP rate " + formatPpp(pppShowGap) +
          ". Market rate " + formatPpp(market) +
          ". Percent gap " + formatPppPlain(gapShow) +
          " percent." + advice;
      } else {
        var typedE = readPppLevel(pppEEl, "a nominal exchange rate E in domestic currency per 1 foreign unit");
        if (!typedE.ok) {
          showPppError(typedE.message);
          return;
        }
        var typedPd = readPppLevel(pppPdEl, "a domestic price index");
        if (!typedPd.ok) {
          showPppError(typedPd.message);
          return;
        }
        var typedPf = readPppLevel(pppPfEl, "a foreign price index");
        if (!typedPf.ok) {
          showPppError(typedPf.message);
          return;
        }
        nominalE = typedE.value;
        domesticP = typedPd.value;
        foreignP = typedPf.value;
        rer = nominalE * (foreignP / domesticP);
        impliedE = domesticP / foreignP;
        if (!isFinite(rer) || rer > pppRateMax || !isFinite(impliedE) || impliedE > pppRateMax) {
          showPppError(pppRateOverflow("a real exchange rate"));
          return;
        }
        if (pppTooSmall(rer) || pppTooSmall(impliedE)) {
          showPppError("Those inputs imply a real exchange rate below 0.01, which this classroom display rounds to zero. Use a larger nominal rate or price indexes that are closer together.");
          return;
        }
        var rerGap = (rer - 1) * 100;
        if (!isFinite(rerGap) || Math.abs(rerGap) > pppGapMax) {
          showPppError("Those inputs imply a gap versus PPP this classroom display cannot show. Use a nominal rate closer to the price index ratio.");
          return;
        }
        var rerShow = roundPpp2(rer);
        var impliedShow = roundPpp2(impliedE);
        var rerGapShow = roundPpp2(rerGap);
        primaryLabel = "Real exchange rate";
        primaryAmount = formatPpp(rerShow);
        primaryDetail = "Equals E times the foreign price index divided by the domestic price index. E is domestic currency per 1 unit of foreign currency.";
        secondLabel = "PPP implied exchange rate";
        secondAmount = formatPpp(impliedShow);
        secondDetail = "Domestic currency per 1 unit of foreign currency. Equals the domestic price index divided by the foreign price index.";
        if (rerShow === 1) {
          plain =
            "The real exchange rate is about 1. Absolute PPP holds for these indexes. The nominal rate matches the ratio of the domestic price index to the foreign price index, at two decimal places.";
        } else if (rerShow > 1) {
          plain =
            "The real exchange rate is above 1. The foreign basket, converted at E, costs more domestic currency than the domestic basket. Relative to these indexes, the foreign currency looks expensive. That is the same direction as a market rate above the PPP implied rate.";
        } else {
          plain =
            "The real exchange rate is below 1. The foreign basket, converted at E, costs less domestic currency than the domestic basket. Relative to these indexes, the foreign currency looks cheap. That is the same direction as a market rate below the PPP implied rate.";
        }
        quote =
          "E is domestic currency per 1 unit of foreign currency. RER equals E times (foreign price index divided by domestic price index). The PPP implied E equals the domestic price index divided by the foreign price index. RER near 1 means absolute PPP holds for these indexes. In the EXAMPLE, domestic is the dollar and foreign is the pound, so E of 1.50 means 1.50 dollars per pound.";
        readNote =
          "Use the near 1 reading when the indexes are price levels for a comparable basket, or when their common base year already matched PPP. Two indexes that both equal 100 in a year you picked do not, by themselves, prove equal purchasing power in that year. The percent gap between E and the PPP implied rate is " +
          formatPppPlain(rerGapShow) +
          " percent, because RER equals E divided by the PPP implied rate, and that gap equals (RER minus 1) times 100. These are numbers you typed, not an official series.";
        arithmetic =
          "The foreign price index divided by the domestic price index is " + formatPpp(foreignP) +
          " divided by " + formatPpp(domesticP) +
          ", which is " + formatPppPlain(foreignP / domesticP) +
          ". Times the nominal rate " + formatPpp(nominalE) +
          ", the real exchange rate is " + formatPppPlain(rer) +
          ". The PPP implied nominal rate is " + formatPpp(domesticP) +
          " divided by " + formatPpp(foreignP) +
          ", which is " + formatPppPlain(impliedE) +
          " domestic currency units per 1 unit of foreign currency. E divided by that implied rate is " +
          formatPppPlain(nominalE / impliedE) +
          ", the same real exchange rate.";
        summary =
          "Nominal rate E " + formatPpp(nominalE) +
          ". Domestic price index " + formatPpp(domesticP) +
          ". Foreign price index " + formatPpp(foreignP) +
          ". Real exchange rate " + formatPpp(rerShow) +
          ". PPP implied E " + formatPpp(impliedShow) +
          "." + advice;
      }

      arithmetic += " Shown to two decimal places.";
      pppPrimaryLabel.textContent = primaryLabel;
      pppPrimaryAmount.textContent = primaryAmount;
      pppPrimaryDetail.textContent = primaryDetail;
      pppSecondLabel.textContent = secondLabel;
      pppSecondAmount.textContent = secondAmount;
      pppSecondDetail.textContent = secondDetail;
      pppPlainEl.textContent = plain;
      pppQuoteEl.textContent = quote;
      pppReadNote.textContent = readNote;
      pppArithmetic.textContent = arithmetic;
      pppSummary.textContent = summary;
      pppResultEl.classList.add("visible");
    });

    if (pppResetBtn) {
      pppResetBtn.addEventListener("click", function () {
        pppPriceAEl.value = "150";
        pppPriceBEl.value = "120";
        pppMarketEl.value = "1.5";
        pppEEl.value = "1.5";
        pppPdEl.value = "150";
        pppPfEl.value = "120";
        setPppMode("absolute");
      });
    }
  }

  /* Money multiplier calculator (classroom deposit expansion) */
  var moneyMultCalcBtn = document.getElementById("calc-money-multiplier");
  if (moneyMultCalcBtn) {
    var mmRrEl = document.getElementById("mm-rr");
    var mmAmountEl = document.getElementById("mm-amount");
    var mmExcessEl = document.getElementById("mm-excess");
    var mmCurrencyEl = document.getElementById("mm-currency");
    var mmModeHint = document.getElementById("mm-mode-hint");
    var mmModeCashBtn = document.getElementById("mm-mode-cash");
    var mmModeOmpBtn = document.getElementById("mm-mode-omp");
    var mmResultEl = document.getElementById("calc-money-multiplier-result");
    var mmSimpleAmount = document.getElementById("mm-simple-amount");
    var mmSimpleDetail = document.getElementById("mm-simple-detail");
    var mmRealisticAmount = document.getElementById("mm-realistic-amount");
    var mmRealisticDetail = document.getElementById("mm-realistic-detail");
    var mmLoansAmount = document.getElementById("mm-loans-amount");
    var mmLoansDetail = document.getElementById("mm-loans-detail");
    var mmDepositsAmount = document.getElementById("mm-deposits-amount");
    var mmDepositsDetail = document.getElementById("mm-deposits-detail");
    var mmMsAmount = document.getElementById("mm-ms-amount");
    var mmMsDetail = document.getElementById("mm-ms-detail");
    var mmArithmetic = document.getElementById("mm-arithmetic");
    var mmReadNote = document.getElementById("mm-read-note");
    var mmSummary = document.getElementById("mm-summary");
    var mmTableNote = document.getElementById("mm-table-note");
    var mmTableWrap = document.getElementById("mm-table-wrap");
    var mmErrorEl = document.getElementById("calc-money-multiplier-error");
    var mmResetBtn = document.getElementById("calc-money-multiplier-reset");
    var mmMode = "cash";
    var mmModeButtons = [mmModeCashBtn, mmModeOmpBtn];
    var mmAmountMax = 1000000000000;
    var mmDisplayMax = 1000000000000000;
    var mmInputs = [mmRrEl, mmAmountEl, mmExcessEl, mmCurrencyEl];

    function showMmError(msg) {
      mmErrorEl.textContent = msg;
      mmErrorEl.classList.add("visible");
      mmResultEl.classList.remove("visible");
    }
    function clearMmError() {
      mmErrorEl.classList.remove("visible");
      mmErrorEl.textContent = "";
    }
    function formatMmMoney(n) {
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function formatMmMult(n) {
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      });
    }
    function formatMmRatio(n) {
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      });
    }
    function formatMmPercent(n) {
      var rounded = Math.round(n * 10000) / 10000;
      return rounded.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4
      });
    }
    function mmCents(n) {
      return Math.round(n * 100);
    }
    function formatMmCents(cents) {
      return (cents / 100).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function readMmRequired(el) {
      var raw = String(el.value).trim();
      if (raw === "" || !isFinite(parseFloat(raw)) || parseFloat(raw) <= 0 || parseFloat(raw) > 100) {
        return {
          ok: false,
          message: "Enter a required reserve ratio above 0 and up to 100 percent. At 0, 1 divided by the ratio is not defined. The Federal Reserve set reserve requirement ratios to zero percent effective 26 March 2020, so this textbook sketch is not a description of the current US system."
        };
      }
      return { ok: true, value: parseFloat(raw) };
    }
    function readMmAmount(el) {
      var raw = String(el.value).trim();
      var n = parseFloat(raw);
      if (raw === "" || !isFinite(n) || n <= 0 || n > mmAmountMax) {
        return {
          ok: false,
          message: "Enter an amount greater than 0 and up to 1,000,000,000,000."
        };
      }
      return { ok: true, value: n };
    }
    function readMmExcess(el) {
      var raw = String(el.value).trim();
      if (raw === "") return { ok: true, value: 0 };
      var n = parseFloat(raw);
      if (!isFinite(n) || n < 0 || n > 100) {
        return {
          ok: false,
          message: "Enter excess reserves from 0 to 100 percent of deposits, or leave the field blank."
        };
      }
      return { ok: true, value: n };
    }
    function readMmCurrency(el) {
      var raw = String(el.value).trim();
      if (raw === "") return { ok: true, value: 0 };
      var n = parseFloat(raw);
      if (!isFinite(n) || n < 0 || n > 1000) {
        return {
          ok: false,
          message: "Enter a currency drain from 0 to 1,000 percent of deposits, or leave the field blank."
        };
      }
      return { ok: true, value: n };
    }
    function mmCell(row, tag, text, header) {
      var cell = document.createElement(tag);
      cell.textContent = text;
      if (header) cell.setAttribute("scope", header);
      row.appendChild(cell);
    }
    function renderMmTable(columns, bodyRows, totalCents) {
      mmTableWrap.textContent = "";
      var table = document.createElement("table");
      table.className = "stat-table";
      var caption = document.createElement("caption");
      caption.style.captionSide = "bottom";
      caption.style.fontSize = "0.85rem";
      caption.style.color = "var(--ink-muted)";
      caption.style.padding = "0.65rem 0.85rem";
      caption.style.textAlign = "left";
      caption.textContent = "Live deposit expansion from the numbers you typed. Classroom arithmetic, not a forecast.";
      table.appendChild(caption);
      var thead = document.createElement("thead");
      var headRow = document.createElement("tr");
      var h;
      for (h = 0; h < columns.length; h++) {
        mmCell(headRow, "th", columns[h].label, "col");
      }
      thead.appendChild(headRow);
      table.appendChild(thead);
      var tbody = document.createElement("tbody");
      var r;
      for (r = 0; r < bodyRows.length; r++) {
        var tr = document.createElement("tr");
        mmCell(tr, "th", bodyRows[r].label, "row");
        for (h = 1; h < columns.length; h++) {
          mmCell(tr, "td", formatMmCents(bodyRows[r][columns[h].key]), null);
        }
        tbody.appendChild(tr);
      }
      var totalTr = document.createElement("tr");
      mmCell(totalTr, "th", "Total", "row");
      for (h = 1; h < columns.length; h++) {
        mmCell(totalTr, "td", formatMmCents(totalCents[columns[h].key]), null);
      }
      tbody.appendChild(totalTr);
      table.appendChild(tbody);
      mmTableWrap.appendChild(table);
    }
    function runMoneyMultiplier() {
      clearMmError();
      var typedRr = readMmRequired(mmRrEl);
      if (!typedRr.ok) {
        showMmError(typedRr.message);
        return;
      }
      var typedAmount = readMmAmount(mmAmountEl);
      if (!typedAmount.ok) {
        showMmError(typedAmount.message);
        return;
      }
      var typedExcess = readMmExcess(mmExcessEl);
      if (!typedExcess.ok) {
        showMmError(typedExcess.message);
        return;
      }
      var typedCurrency = readMmCurrency(mmCurrencyEl);
      if (!typedCurrency.ok) {
        showMmError(typedCurrency.message);
        return;
      }
      if (typedRr.value + typedExcess.value > 100.0000001) {
        showMmError("Required reserves plus excess reserves are above 100 percent of deposits, so loans would be negative. Lower one of those percents.");
        return;
      }

      var rr = typedRr.value / 100;
      var e = typedExcess.value / 100;
      var c = typedCurrency.value / 100;
      var amount = typedAmount.value;
      var den = rr + e + c;
      var lend = 1 - rr - e;
      if (lend < 0 && lend > -0.000000001) lend = 0;
      if (!(den > 0) || lend < 0) {
        showMmError("Those inputs do not fit this classroom formula. The required reserve ratio must stay above 0, and required reserves plus excess reserves cannot exceed 100 percent.");
        return;
      }

      var simple = 1 / rr;
      var realistic = (1 + c) / den;
      var totalDep = amount * (1 + c) / den;
      var totalLoans = amount * lend * (1 + c) / den;
      var totalReq = rr * totalDep;
      var totalExcess = e * totalDep;
      var totalCurr = totalLoans * c / (1 + c);
      var eqMs = realistic * amount;
      var eqDep = amount / den;
      var eqLoans = lend * eqDep;
      var ms = mmMode === "cash" ? totalLoans : totalDep + totalCurr;
      var figures = [simple, realistic, totalDep, totalLoans, totalReq, totalExcess, totalCurr, eqMs, eqDep, eqLoans, ms];
      var f;
      for (f = 0; f < figures.length; f++) {
        if (!isFinite(figures[f]) || Math.abs(figures[f]) > mmDisplayMax) {
          showMmError("Those inputs imply a change this classroom display cannot show. Use a larger required reserve ratio or a smaller amount.");
          return;
        }
      }

      var showExcess = typedExcess.value > 0;
      var showCurrency = typedCurrency.value > 0;
      var columns = [
        { key: "label", label: "Bank" },
        { key: "dep", label: "New deposit" },
        { key: "req", label: "Required reserves" }
      ];
      if (showExcess) columns.push({ key: "excess", label: "Excess reserves" });
      columns.push({ key: "loans", label: "New loans" });
      if (showCurrency) columns.push({ key: "curr", label: "Currency kept" });

      var shown = [];
      var depCursor = amount;
      var rowLimit = 6;
      var rowIndex;
      for (rowIndex = 0; rowIndex < rowLimit; rowIndex++) {
        if (depCursor < 0.005) break;
        var rowLoans = depCursor * lend;
        if (rowLoans < 0) rowLoans = 0;
        var row = {
          dep: depCursor,
          req: rr * depCursor,
          excess: e * depCursor,
          loans: rowLoans,
          curr: rowLoans * c / (1 + c)
        };
        shown.push(row);
        if (rowLoans < 0.005) break;
        depCursor = rowLoans / (1 + c);
      }

      var keys = ["dep", "req", "excess", "loans", "curr"];
      var shownCents = [];
      var sumCents = { dep: 0, req: 0, excess: 0, loans: 0, curr: 0 };
      for (rowIndex = 0; rowIndex < shown.length; rowIndex++) {
        var centsRow = { label: "Bank " + (rowIndex + 1) };
        var keyIndex;
        for (keyIndex = 0; keyIndex < keys.length; keyIndex++) {
          var keyName = keys[keyIndex];
          centsRow[keyName] = mmCents(shown[rowIndex][keyName]);
          sumCents[keyName] += centsRow[keyName];
        }
        shownCents.push(centsRow);
      }
      var totalCents = {
        dep: mmCents(totalDep),
        req: mmCents(totalReq),
        excess: mmCents(totalExcess),
        loans: mmCents(totalLoans),
        curr: mmCents(totalCurr)
      };
      var laterCents = {
        dep: totalCents.dep - sumCents.dep,
        req: totalCents.req - sumCents.req,
        excess: totalCents.excess - sumCents.excess,
        loans: totalCents.loans - sumCents.loans,
        curr: totalCents.curr - sumCents.curr
      };
      var laterNegative = false;
      for (keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        if (laterCents[keys[keyIndex]] < 0) laterNegative = true;
      }
      if (laterNegative && shownCents.length) {
        var lastShown = shownCents[shownCents.length - 1];
        for (keyIndex = 0; keyIndex < keys.length; keyIndex++) {
          lastShown[keys[keyIndex]] += laterCents[keys[keyIndex]];
        }
        laterCents = { dep: 0, req: 0, excess: 0, loans: 0, curr: 0 };
      }
      var laterMatters = laterCents.dep !== 0 || laterCents.loans !== 0 || laterCents.req !== 0 || laterCents.excess !== 0 || laterCents.curr !== 0;
      if (laterMatters) {
        laterCents.label = "Later banks";
        shownCents.push(laterCents);
      }

      var ratioRr = formatMmRatio(rr);
      var ratioE = formatMmRatio(e);
      var ratioC = formatMmRatio(c);
      var simpleText = formatMmMult(simple);
      var realisticText = formatMmMult(realistic);
      var amountText = formatMmMoney(amount);
      var loansText = formatMmMoney(totalLoans);
      var depositsText = formatMmMoney(totalDep);
      var msText = formatMmMoney(ms);
      var eqMsText = formatMmMoney(eqMs);
      var eqDepText = formatMmMoney(eqDep);
      var eqLoansText = formatMmMoney(eqLoans);

      mmSimpleAmount.textContent = simpleText;
      mmSimpleDetail.textContent = "Equals 1 divided by " + ratioRr + ".";
      var realisticDetail =
        "Equals (1 + " + ratioC + ") divided by (" + ratioRr + " + " + ratioE + " + " + ratioC + "). " +
        "If this amount is new monetary base, the equilibrium change in the money supply is " + eqMsText + ". " +
        "Equilibrium deposits are " + eqDepText + ". Equilibrium loans are " + eqLoansText + ".";
      if (typedCurrency.value === 0) {
        realisticDetail += " With a currency drain of zero, equilibrium deposits and loans match the table.";
      } else {
        realisticDetail += " With a currency drain above zero, the table keeps the first deposit whole and drains currency only from later loans, so its totals differ from this equilibrium reading.";
      }
      mmRealisticAmount.textContent = realisticText;
      mmRealisticDetail.textContent = realisticDetail;
      mmLoansAmount.textContent = loansText;
      mmLoansDetail.textContent = "Sum of new loans in the deposit chain.";
      mmDepositsAmount.textContent = depositsText;
      mmDepositsDetail.textContent = "Sum of deposits in the deposit chain, including the first deposit.";
      if (mmMode === "cash") {
        mmMsDetail.textContent = "Equals the loan total. The original amount was already in M1, so the first deposit does not raise the money supply.";
      } else if (typedCurrency.value === 0) {
        mmMsDetail.textContent = "Equals the deposit total. The open market purchase creates new money, so the first deposit counts.";
      } else {
        mmMsDetail.textContent = "Equals the deposit total plus currency the public kept from the loans. The open market purchase creates new money, and currency kept from later loans counts too.";
      }
      mmMsAmount.textContent = msText;

      mmArithmetic.textContent =
        "Simple multiplier: 1 divided by " + ratioRr + " equals " + simpleText + ". " +
        "Realistic multiplier: (1 + " + ratioC + ") divided by (" + ratioRr + " + " + ratioE + " + " + ratioC + ") equals " + realisticText + ". " +
        "Deposit chain deposits: " + amountText + " times (1 + " + ratioC + ") divided by (" + ratioRr + " + " + ratioE + " + " + ratioC + ") equals " + depositsText + ". " +
        "Deposit chain loans: " + amountText + " times (1 minus " + ratioRr + " minus " + ratioE + ") times (1 + " + ratioC + ") divided by (" + ratioRr + " + " + ratioE + " + " + ratioC + ") equals " + loansText + ". " +
        "Equilibrium money supply if the amount is new monetary base: " + realisticText + " times " + amountText + " equals " + eqMsText + ". " +
        "Shown to two decimal places.";

      var readNote;
      if (mmMode === "cash") {
        readNote = "This mode treats the amount as cash that was already in M1. Bank 1's deposit replaces currency, so that first swap does not raise the money supply. The maximum change in the money supply equals the new loans. ";
      } else {
        readNote = "This mode treats the amount as an open market purchase that the seller deposits. The first deposit is new money. With no currency drain, the maximum change in the money supply equals the deposit total. ";
      }
      readNote +=
        "A simple multiplier of " + simpleText + " is 1 divided by the required reserve ratio alone. " +
        "The realistic multiplier of " + realisticText + " is the monetary base formula. " +
        "Neither figure is a forecast of M1 or M2, and neither is a recommendation about reserve requirements or bond purchases.";
      mmReadNote.textContent = readNote;

      mmSummary.textContent =
        "Required reserve ratio " + formatMmPercent(typedRr.value) + " percent. " +
        "Excess reserves " + formatMmPercent(typedExcess.value) + " percent. " +
        "Currency drain " + formatMmPercent(typedCurrency.value) + " percent. " +
        "Amount " + amountText + ". " +
        "Simple multiplier " + simpleText + ". " +
        "Realistic multiplier " + realisticText + ". " +
        "Maximum change in loans " + loansText + ". " +
        "Maximum change in deposits " + depositsText + ". " +
        "Maximum change in the money supply " + msText + ". " +
        (mmMode === "cash" ? "Cash already in M1. " : "Open market purchase. ") +
        "Educational estimate only. Not a forecast and not investment advice.";

      mmTableNote.textContent =
        "Each numbered row is one bank. The later banks row, when it appears, collects every round after the rows shown, so the total matches the infinite sum. Required reserves equal the required reserve ratio times the deposit. New loans equal the deposit minus required reserves minus excess reserves. The next deposit equals new loans divided by (1 + c).";

      renderMmTable(columns, shownCents, totalCents);
      mmResultEl.classList.add("visible");
    }
    function setMmMode(mode) {
      mmMode = mode;
      var activeBtn = mode === "omp" ? mmModeOmpBtn : mmModeCashBtn;
      var hint = "Cash already in M1. Bank 1 starts with the amount as a new deposit. The maximum change in the money supply equals the new loans, because that cash was already counted in the money supply.";
      if (mode === "omp") {
        hint = "Open market purchase. The seller deposits the payment, so Bank 1 still starts with that amount. The first deposit is new money. With no currency drain, the maximum change in the money supply equals the deposit total.";
      }
      var i;
      for (i = 0; i < mmModeButtons.length; i++) {
        var on = mmModeButtons[i] === activeBtn;
        mmModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        mmModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      mmModeHint.textContent = hint;
      runMoneyMultiplier();
    }

    mmModeCashBtn.addEventListener("click", function () {
      setMmMode("cash");
    });
    mmModeOmpBtn.addEventListener("click", function () {
      setMmMode("omp");
    });
    moneyMultCalcBtn.addEventListener("click", runMoneyMultiplier);
    var mmInputIndex;
    for (mmInputIndex = 0; mmInputIndex < mmInputs.length; mmInputIndex++) {
      mmInputs[mmInputIndex].addEventListener("input", runMoneyMultiplier);
    }
    if (mmResetBtn) {
      mmResetBtn.addEventListener("click", function () {
        mmRrEl.value = "10";
        mmAmountEl.value = "1000";
        mmExcessEl.value = "0";
        mmCurrencyEl.value = "0";
        setMmMode("cash");
      });
    }
    setMmMode("cash");
  }

  /* Opportunity cost and comparative advantage */
  var opportunityCostBtn = document.getElementById("calc-opportunity-cost");
  if (opportunityCostBtn) {
    var ocGoodANameEl = document.getElementById("oc-good-a-name");
    var ocGoodBNameEl = document.getElementById("oc-good-b-name");
    var ocProducerEl = document.getElementById("oc-producer");
    var ocAEl = document.getElementById("oc-a");
    var ocBEl = document.getElementById("oc-b");
    var ocP1NameEl = document.getElementById("oc-p1-name");
    var ocP1AEl = document.getElementById("oc-p1-a");
    var ocP1BEl = document.getElementById("oc-p1-b");
    var ocP2NameEl = document.getElementById("oc-p2-name");
    var ocP2AEl = document.getElementById("oc-p2-a");
    var ocP2BEl = document.getElementById("oc-p2-b");
    var ocSingleFields = document.getElementById("oc-single-fields");
    var ocCompareFields = document.getElementById("oc-compare-fields");
    var ocModeHint = document.getElementById("oc-mode-hint");
    var ocModeSingleBtn = document.getElementById("oc-mode-single");
    var ocModeCompareBtn = document.getElementById("oc-mode-compare");
    var ocResultEl = document.getElementById("calc-opportunity-cost-result");
    var ocABlock = document.getElementById("oc-a-block");
    var ocBBlock = document.getElementById("oc-b-block");
    var ocALabel = document.getElementById("oc-a-label");
    var ocBLabel = document.getElementById("oc-b-label");
    var ocAAmount = document.getElementById("oc-a-amount");
    var ocBAmount = document.getElementById("oc-b-amount");
    var ocADetail = document.getElementById("oc-a-detail");
    var ocBDetail = document.getElementById("oc-b-detail");
    var ocAbsoluteBlock = document.getElementById("oc-absolute-block");
    var ocComparativeBlock = document.getElementById("oc-comparative-block");
    var ocTradeBlock = document.getElementById("oc-trade-block");
    var ocAbsoluteDetail = document.getElementById("oc-absolute-detail");
    var ocComparativeDetail = document.getElementById("oc-comparative-detail");
    var ocTradeLabel = document.getElementById("oc-trade-label");
    var ocTradeAmount = document.getElementById("oc-trade-amount");
    var ocTradeDetail = document.getElementById("oc-trade-detail");
    var ocArithmetic = document.getElementById("oc-arithmetic");
    var ocReadNote = document.getElementById("oc-read-note");
    var ocSummary = document.getElementById("oc-summary");
    var ocTableNote = document.getElementById("oc-table-note");
    var ocTableWrap = document.getElementById("oc-table-wrap");
    var ocErrorEl = document.getElementById("calc-opportunity-cost-error");
    var ocResetBtn = document.getElementById("calc-opportunity-cost-reset");
    var ocMode = "single";
    var ocModeButtons = [ocModeSingleBtn, ocModeCompareBtn];
    var ocOutputMax = 1000000000000;
    var ocInputs = [
      ocGoodANameEl, ocGoodBNameEl, ocProducerEl, ocAEl, ocBEl,
      ocP1NameEl, ocP1AEl, ocP1BEl, ocP2NameEl, ocP2AEl, ocP2BEl
    ];

    function showOcError(msg) {
      ocErrorEl.textContent = msg;
      ocErrorEl.classList.add("visible");
      ocResultEl.classList.remove("visible");
    }
    function clearOcError() {
      ocErrorEl.classList.remove("visible");
      ocErrorEl.textContent = "";
    }
    function formatOc(n) {
      var abs = Math.abs(n);
      if (abs !== 0 && abs < 0.0001) {
        return n.toLocaleString(undefined, { maximumSignificantDigits: 4 });
      }
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: abs >= 1000 ? 2 : 4
      });
    }
    function isWhole(n) {
      return isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9 && Math.abs(n) <= ocOutputMax;
    }
    function gcdOc(a, b) {
      a = Math.abs(Math.round(a));
      b = Math.abs(Math.round(b));
      while (b) {
        var t = b;
        b = a % b;
        a = t;
      }
      return a || 1;
    }
    function fractionText(numer, denom) {
      if (!isWhole(numer) || !isWhole(denom) || denom === 0) return "";
      var n = Math.round(numer);
      var d = Math.round(denom);
      var g = gcdOc(n, d);
      n = n / g;
      d = d / g;
      if (d < 0) {
        n = -n;
        d = -d;
      }
      if (d === 1) return String(n);
      if (d > 100) return "";
      return n + "/" + d;
    }
    function ratioInfo(numer, denom) {
      var ratio = numer / denom;
      var frac = fractionText(numer, denom);
      var decimal = formatOc(ratio);
      return {
        ratio: ratio,
        decimal: decimal,
        fraction: frac,
        primary: frac || decimal
      };
    }
    function nearlyEqual(a, b) {
      var scale = Math.max(1, Math.abs(a), Math.abs(b));
      return Math.abs(a - b) <= scale * 1e-9;
    }
    function readOcName(el, fallback) {
      var raw = String(el.value).replace(/\s+/g, " ").trim();
      if (raw === "") return { ok: true, value: fallback };
      if (raw.length > 40) {
        return { ok: false, message: "Use a name of 40 characters or fewer, or leave the name blank." };
      }
      return { ok: true, value: raw };
    }
    function readOcOutput(el, label) {
      var raw = String(el.value).trim();
      if (raw === "" || !/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(raw)) {
        return {
          ok: false,
          message: "Enter a numeric value for " + label + ". Blank and non numeric text are not valid."
        };
      }
      var n = Number(raw);
      if (!isFinite(n)) {
        return { ok: false, message: "Enter a finite number for " + label + "." };
      }
      if (n <= 0) {
        return {
          ok: false,
          message: "Enter " + label + " greater than 0. Zero and negative outputs are not defined in this opportunity cost ratio."
        };
      }
      if (n > ocOutputMax) {
        return { ok: false, message: "Enter " + label + " up to 1,000,000,000,000." };
      }
      return { ok: true, value: n };
    }
    function ocCell(row, tag, text, header) {
      var cell = document.createElement(tag);
      cell.textContent = text;
      if (header) cell.setAttribute("scope", header);
      row.appendChild(cell);
    }
    function renderOcTable(goodA, goodB, rows) {
      ocTableWrap.textContent = "";
      var table = document.createElement("table");
      table.className = "stat-table";
      var caption = document.createElement("caption");
      caption.style.captionSide = "bottom";
      caption.style.fontSize = "0.85rem";
      caption.style.color = "var(--ink-muted)";
      caption.style.padding = "0.65rem 0.85rem";
      caption.style.textAlign = "left";
      caption.textContent = "Live comparison from the numbers you typed. Classroom arithmetic, not country data.";
      table.appendChild(caption);
      var thead = document.createElement("thead");
      var headRow = document.createElement("tr");
      var headers = [
        "Producer",
        "Max " + goodA,
        "Max " + goodB,
        "Opportunity cost of 1 " + goodA,
        "Opportunity cost of 1 " + goodB
      ];
      var h;
      for (h = 0; h < headers.length; h++) ocCell(headRow, "th", headers[h], "col");
      thead.appendChild(headRow);
      table.appendChild(thead);
      var tbody = document.createElement("tbody");
      var r;
      for (r = 0; r < rows.length; r++) {
        var tr = document.createElement("tr");
        ocCell(tr, "th", rows[r].name, "row");
        ocCell(tr, "td", rows[r].maxA, null);
        ocCell(tr, "td", rows[r].maxB, null);
        ocCell(tr, "td", rows[r].ocA, null);
        ocCell(tr, "td", rows[r].ocB, null);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      ocTableWrap.appendChild(table);
    }
    function clearOcTable() {
      ocTableWrap.textContent = "";
    }
    function absoluteSentence(goodName, name1, max1, name2, max2) {
      if (nearlyEqual(max1, max2)) {
        return "Tie in " + goodName + ". " + name1 + " and " + name2 + " can each produce " + formatOc(max1) + ".";
      }
      if (max1 > max2) {
        return name1 + " has the absolute advantage in " + goodName + " (" + formatOc(max1) + " compared with " + formatOc(max2) + ").";
      }
      return name2 + " has the absolute advantage in " + goodName + " (" + formatOc(max2) + " compared with " + formatOc(max1) + ").";
    }
    function comparativeSentence(goodName, otherName, name1, oc1, name2, oc2) {
      if (nearlyEqual(oc1, oc2)) {
        return "Neither has a comparative advantage in " + goodName + ". Both give up " + formatOc(oc1) + " " + otherName + " to make 1 " + goodName + ".";
      }
      if (oc1 < oc2) {
        return name1 + " has the comparative advantage in " + goodName + ", with an opportunity cost of " + formatOc(oc1) + " " + otherName + " compared with " + formatOc(oc2) + " for " + name2 + ".";
      }
      return name2 + " has the comparative advantage in " + goodName + ", with an opportunity cost of " + formatOc(oc2) + " " + otherName + " compared with " + formatOc(oc1) + " for " + name1 + ".";
    }
    function ratioSentence(numer, denom, unit) {
      var info = ratioInfo(numer, denom);
      var text = formatOc(numer) + " divided by " + formatOc(denom) + ", which is " + info.decimal + " " + unit;
      if (info.fraction && info.fraction !== info.decimal) text += " (" + info.fraction + ")";
      return text;
    }
    function runOpportunityCost() {
      clearOcError();
      var goodA = readOcName(ocGoodANameEl, "good A");
      if (!goodA.ok) {
        showOcError(goodA.message);
        return;
      }
      var goodB = readOcName(ocGoodBNameEl, "good B");
      if (!goodB.ok) {
        showOcError(goodB.message);
        return;
      }
      if (goodA.value.toLowerCase() === goodB.value.toLowerCase()) {
        goodA.value = goodA.value + " (good A)";
        goodB.value = goodB.value + " (good B)";
      }

      if (ocMode === "single") {
        var producer = readOcName(ocProducerEl, "This producer");
        if (!producer.ok) {
          showOcError(producer.message);
          return;
        }
        var outA = readOcOutput(ocAEl, goodA.value + " output");
        if (!outA.ok) {
          showOcError(outA.message);
          return;
        }
        var outB = readOcOutput(ocBEl, goodB.value + " output");
        if (!outB.ok) {
          showOcError(outB.message);
          return;
        }
        var costA = ratioInfo(outB.value, outA.value);
        var costB = ratioInfo(outA.value, outB.value);
        ocABlock.hidden = false;
        ocBBlock.hidden = false;
        ocAbsoluteBlock.hidden = true;
        ocComparativeBlock.hidden = true;
        ocTradeBlock.hidden = true;
        clearOcTable();
        ocTableNote.textContent = "";
        ocALabel.textContent = "Opportunity cost of 1 " + goodA.value;
        ocBLabel.textContent = "Opportunity cost of 1 " + goodB.value;
        ocAAmount.textContent = costA.primary + " " + goodB.value;
        ocBAmount.textContent = costB.primary + " " + goodA.value;
        ocADetail.textContent = producer.value + " gives up " + costA.decimal + " " + goodB.value + " to produce 1 more " + goodA.value + ". That is " + goodB.value + " output divided by " + goodA.value + " output.";
        ocBDetail.textContent = producer.value + " gives up " + costB.decimal + " " + goodA.value + " to produce 1 more " + goodB.value + ". That is " + goodA.value + " output divided by " + goodB.value + " output.";
        ocArithmetic.textContent =
          "Opportunity cost of 1 " + goodA.value + " equals " + ratioSentence(outB.value, outA.value, goodB.value) + ". " +
          "Opportunity cost of 1 " + goodB.value + " equals " + ratioSentence(outA.value, outB.value, goodA.value) + ".";
        ocReadNote.textContent =
          "These two ratios are reciprocals. They describe one producer and one unit of resource, or one unit of time. They do not say who should trade, and they are not a forecast of exports.";
        ocSummary.textContent =
          producer.value + ". " +
          formatOc(outA.value) + " " + goodA.value + " or " + formatOc(outB.value) + " " + goodB.value + " per unit of resource. " +
          "Opportunity cost of 1 " + goodA.value + " is " + costA.primary + " " + goodB.value + ". " +
          "Opportunity cost of 1 " + goodB.value + " is " + costB.primary + " " + goodA.value + ". " +
          "Educational estimate only. Not a forecast and not investment advice.";
        ocResultEl.classList.add("visible");
        return;
      }

      var name1 = readOcName(ocP1NameEl, "Producer 1");
      if (!name1.ok) {
        showOcError(name1.message);
        return;
      }
      var name2 = readOcName(ocP2NameEl, "Producer 2");
      if (!name2.ok) {
        showOcError(name2.message);
        return;
      }
      if (name1.value.toLowerCase() === name2.value.toLowerCase()) {
        name1.value = name1.value + " (producer 1)";
        name2.value = name2.value + " (producer 2)";
      }
      var p1a = readOcOutput(ocP1AEl, name1.value + " maximum " + goodA.value);
      if (!p1a.ok) {
        showOcError(p1a.message);
        return;
      }
      var p1b = readOcOutput(ocP1BEl, name1.value + " maximum " + goodB.value);
      if (!p1b.ok) {
        showOcError(p1b.message);
        return;
      }
      var p2a = readOcOutput(ocP2AEl, name2.value + " maximum " + goodA.value);
      if (!p2a.ok) {
        showOcError(p2a.message);
        return;
      }
      var p2b = readOcOutput(ocP2BEl, name2.value + " maximum " + goodB.value);
      if (!p2b.ok) {
        showOcError(p2b.message);
        return;
      }

      var oc1a = ratioInfo(p1b.value, p1a.value);
      var oc1b = ratioInfo(p1a.value, p1b.value);
      var oc2a = ratioInfo(p2b.value, p2a.value);
      var oc2b = ratioInfo(p2a.value, p2b.value);
      var sameA = nearlyEqual(oc1a.ratio, oc2a.ratio);
      var lowA = Math.min(oc1a.ratio, oc2a.ratio);
      var highA = Math.max(oc1a.ratio, oc2a.ratio);
      var clothMaker = oc1a.ratio < oc2a.ratio ? name1.value : name2.value;
      var wineMaker = oc1b.ratio < oc2b.ratio ? name1.value : name2.value;

      ocABlock.hidden = true;
      ocBBlock.hidden = true;
      ocAbsoluteBlock.hidden = false;
      ocComparativeBlock.hidden = false;
      ocTradeBlock.hidden = false;
      ocAbsoluteDetail.textContent =
        absoluteSentence(goodA.value, name1.value, p1a.value, name2.value, p2a.value) + " " +
        absoluteSentence(goodB.value, name1.value, p1b.value, name2.value, p2b.value);
      ocComparativeDetail.textContent =
        comparativeSentence(goodA.value, goodB.value, name1.value, oc1a.ratio, name2.value, oc2a.ratio) + " " +
        comparativeSentence(goodB.value, goodA.value, name1.value, oc1b.ratio, name2.value, oc2b.ratio);
      ocTradeLabel.textContent = "Terms of trade for 1 " + goodA.value;
      if (sameA) {
        ocTradeAmount.textContent = "No range";
        ocTradeDetail.textContent =
          "Opportunity costs are equal, so neither producer has a comparative advantage in either good. There is no terms of trade range that makes both gain from specialization, because a price that matches one producer's opportunity cost matches the other's too.";
      } else {
        ocTradeAmount.textContent = formatOc(lowA) + " to " + formatOc(highA) + " " + goodB.value;
        ocTradeDetail.textContent =
          "Both gain if they specialize and 1 " + goodA.value + " trades for strictly more than " + formatOc(lowA) + " " + goodB.value +
          " and strictly less than " + formatOc(highA) + " " + goodB.value + ". " +
          "Equivalently, 1 " + goodB.value + " trades for strictly more than " + formatOc(1 / highA) + " " + goodA.value +
          " and strictly less than " + formatOc(1 / lowA) + " " + goodA.value + ". " +
          clothMaker + " specializes in " + goodA.value + ". " + wineMaker + " specializes in " + goodB.value + ". " +
          "A price equal to either opportunity cost leaves one producer with no gain.";
      }
      ocArithmetic.textContent =
        name1.value + ": opportunity cost of 1 " + goodA.value + " equals " + ratioSentence(p1b.value, p1a.value, goodB.value) + ". " +
        "Opportunity cost of 1 " + goodB.value + " equals " + ratioSentence(p1a.value, p1b.value, goodA.value) + ". " +
        name2.value + ": opportunity cost of 1 " + goodA.value + " equals " + ratioSentence(p2b.value, p2a.value, goodB.value) + ". " +
        "Opportunity cost of 1 " + goodB.value + " equals " + ratioSentence(p2a.value, p2b.value, goodA.value) + ".";
      ocReadNote.textContent =
        "Absolute advantage compares the maximum outputs. Comparative advantage compares the opportunity costs. A producer can lead on both maximums and still have the higher opportunity cost in one good. This is a straight frontier with constant opportunity cost. It is classroom arithmetic, not trade policy advice, and not a forecast of exports.";
      ocSummary.textContent =
        name1.value + " " + formatOc(p1a.value) + " " + goodA.value + " or " + formatOc(p1b.value) + " " + goodB.value + ". " +
        name2.value + " " + formatOc(p2a.value) + " " + goodA.value + " or " + formatOc(p2b.value) + " " + goodB.value + ". " +
        (sameA
          ? "Opportunity costs match, so neither has a comparative advantage. "
          : clothMaker + " has the comparative advantage in " + goodA.value + ". " + wineMaker + " has the comparative advantage in " + goodB.value + ". ") +
        "Educational estimate only. Not a forecast and not investment advice.";
      ocTableNote.textContent =
        "Each row is one producer. Maximum output is what that producer can make if all resources go to that good. Opportunity cost of 1 " + goodA.value + " is maximum " + goodB.value + " divided by maximum " + goodA.value + ".";
      renderOcTable(goodA.value, goodB.value, [
        {
          name: name1.value,
          maxA: formatOc(p1a.value),
          maxB: formatOc(p1b.value),
          ocA: oc1a.primary + " " + goodB.value,
          ocB: oc1b.primary + " " + goodA.value
        },
        {
          name: name2.value,
          maxA: formatOc(p2a.value),
          maxB: formatOc(p2b.value),
          ocA: oc2a.primary + " " + goodB.value,
          ocB: oc2b.primary + " " + goodA.value
        }
      ]);
      ocResultEl.classList.add("visible");
    }
    function setOcMode(mode) {
      ocMode = mode;
      ocSingleFields.hidden = mode !== "single";
      ocCompareFields.hidden = mode !== "compare";
      var activeBtn = mode === "compare" ? ocModeCompareBtn : ocModeSingleBtn;
      var hint = "One producer. Enter how much of each good the same unit of resource, or the same amount of time, can produce. The opportunity cost of 1 unit of good A is good B output divided by good A output.";
      if (mode === "compare") {
        hint = "Two producers, constant opportunity cost. Enter each producer's maximum output of each good if all resources go to that good. That is a straight production possibilities frontier. The page then compares opportunity costs, absolute advantage, comparative advantage, and a terms of trade range.";
      }
      var i;
      for (i = 0; i < ocModeButtons.length; i++) {
        var on = ocModeButtons[i] === activeBtn;
        ocModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        ocModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      ocModeHint.textContent = hint;
      runOpportunityCost();
    }

    ocModeSingleBtn.addEventListener("click", function () {
      setOcMode("single");
    });
    ocModeCompareBtn.addEventListener("click", function () {
      setOcMode("compare");
    });
    opportunityCostBtn.addEventListener("click", runOpportunityCost);
    var ocInputIndex;
    for (ocInputIndex = 0; ocInputIndex < ocInputs.length; ocInputIndex++) {
      ocInputs[ocInputIndex].addEventListener("input", runOpportunityCost);
    }
    if (ocResetBtn) {
      ocResetBtn.addEventListener("click", function () {
        ocGoodANameEl.value = "cloth";
        ocGoodBNameEl.value = "wine";
        ocProducerEl.value = "Atelier";
        ocAEl.value = "8";
        ocBEl.value = "4";
        ocP1NameEl.value = "Atelier";
        ocP1AEl.value = "8";
        ocP1BEl.value = "4";
        ocP2NameEl.value = "Cellar";
        ocP2AEl.value = "6";
        ocP2BEl.value = "12";
        setOcMode("single");
      });
    }
    setOcMode("single");
  }

  /* Supply and demand equilibrium */
  var supplyDemandBtn = document.getElementById("calc-supply-demand");
  if (supplyDemandBtn) {
    var sdAEl = document.getElementById("sd-a");
    var sdBEl = document.getElementById("sd-b");
    var sdCEl = document.getElementById("sd-c");
    var sdDEl = document.getElementById("sd-d");
    var sdP0El = document.getElementById("sd-p0");
    var sdPriceFields = document.getElementById("sd-price-fields");
    var sdModeHint = document.getElementById("sd-mode-hint");
    var sdModeEquilibriumBtn = document.getElementById("sd-mode-equilibrium");
    var sdModeGapBtn = document.getElementById("sd-mode-gap");
    var sdResultEl = document.getElementById("calc-supply-demand-result");
    var sdPrimaryBlock = document.getElementById("sd-primary-block");
    var sdPrimaryLabel = document.getElementById("sd-primary-label");
    var sdPrimaryAmount = document.getElementById("sd-primary-amount");
    var sdPrimaryDetail = document.getElementById("sd-primary-detail");
    var sdQuantityBlock = document.getElementById("sd-quantity-block");
    var sdQuantityLabel = document.getElementById("sd-quantity-label");
    var sdQuantityAmount = document.getElementById("sd-quantity-amount");
    var sdQuantityDetail = document.getElementById("sd-quantity-detail");
    var sdQdBlock = document.getElementById("sd-qd-block");
    var sdQsBlock = document.getElementById("sd-qs-block");
    var sdQdAmount = document.getElementById("sd-qd-amount");
    var sdQsAmount = document.getElementById("sd-qs-amount");
    var sdQdDetail = document.getElementById("sd-qd-detail");
    var sdQsDetail = document.getElementById("sd-qs-detail");
    var sdCsBlock = document.getElementById("sd-cs-block");
    var sdPsBlock = document.getElementById("sd-ps-block");
    var sdTsBlock = document.getElementById("sd-ts-block");
    var sdCsAmount = document.getElementById("sd-cs-amount");
    var sdPsAmount = document.getElementById("sd-ps-amount");
    var sdTsAmount = document.getElementById("sd-ts-amount");
    var sdCsDetail = document.getElementById("sd-cs-detail");
    var sdPsDetail = document.getElementById("sd-ps-detail");
    var sdTsDetail = document.getElementById("sd-ts-detail");
    var sdArithmetic = document.getElementById("sd-arithmetic");
    var sdReadNote = document.getElementById("sd-read-note");
    var sdSummary = document.getElementById("sd-summary");
    var sdErrorEl = document.getElementById("calc-supply-demand-error");
    var sdResetBtn = document.getElementById("calc-supply-demand-reset");
    var sdMode = "equilibrium";
    var sdModeButtons = [sdModeEquilibriumBtn, sdModeGapBtn];
    var sdMax = 1000000000000;
    var sdInputs = [sdAEl, sdBEl, sdCEl, sdDEl, sdP0El];
    var sdMinus = "\u2212";
    var sdTimes = "\u00d7";

    function showSdError(msg) {
      sdErrorEl.textContent = msg;
      sdErrorEl.classList.add("visible");
      sdResultEl.classList.remove("visible");
    }
    function clearSdError() {
      sdErrorEl.classList.remove("visible");
      sdErrorEl.textContent = "";
    }
    function formatSd(n) {
      var abs = Math.abs(n);
      var text;
      if (abs !== 0 && abs < 0.0001) {
        text = abs.toLocaleString(undefined, { maximumSignificantDigits: 4 });
      } else {
        text = abs.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: abs >= 1000 ? 2 : 4
        });
      }
      return n < 0 ? sdMinus + text : text;
    }
    function sdNearlyEqual(a, b) {
      var scale = Math.max(1, Math.abs(a), Math.abs(b));
      return Math.abs(a - b) <= scale * 1e-9;
    }
    function readSdNumber(el, label) {
      var raw = String(el.value).trim();
      if (raw === "" || !/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(raw)) {
        return {
          ok: false,
          message: "Enter a numeric value for " + label + ". Blank and non numeric text are not valid."
        };
      }
      var n = Number(raw);
      if (!isFinite(n)) {
        return { ok: false, message: "Enter a finite number for " + label + "." };
      }
      if (Math.abs(n) > sdMax) {
        return {
          ok: false,
          message: "Enter " + label + " with an absolute value up to 1,000,000,000,000."
        };
      }
      return { ok: true, value: n };
    }
    function fmtDiff(left, right) {
      if (right < 0) return "(" + formatSd(left) + " " + sdMinus + " (" + formatSd(right) + "))";
      return "(" + formatSd(left) + " " + sdMinus + " " + formatSd(right) + ")";
    }
    function hideSurplusBlocks() {
      sdCsBlock.hidden = true;
      sdPsBlock.hidden = true;
      sdTsBlock.hidden = true;
    }
    function runSupplyDemand() {
      clearSdError();
      var a = readSdNumber(sdAEl, "the demand intercept a");
      if (!a.ok) {
        showSdError(a.message);
        return;
      }
      var b = readSdNumber(sdBEl, "the demand slope b");
      if (!b.ok) {
        showSdError(b.message);
        return;
      }
      var c = readSdNumber(sdCEl, "the supply intercept c");
      if (!c.ok) {
        showSdError(c.message);
        return;
      }
      var d = readSdNumber(sdDEl, "the supply slope d");
      if (!d.ok) {
        showSdError(d.message);
        return;
      }
      if (!(b.value > 0)) {
        showSdError("Enter a demand slope b greater than 0. In Qd = a " + sdMinus + " bP, b is how much quantity demanded falls when the price rises by 1. A b of 0 makes quantity ignore the price. A negative b makes the demand line slope upward.");
        return;
      }
      if (!(d.value > 0)) {
        showSdError("Enter a supply slope d greater than 0. In Qs = c + dP, d is how much quantity supplied rises when the price rises by 1. A d of 0 makes quantity ignore the price. A negative d makes the supply line slope downward.");
        return;
      }
      if (b.value + d.value === 0) {
        showSdError("b + d equals 0, so the equilibrium price (a " + sdMinus + " c) / (b + d) is not defined.");
        return;
      }
      var pStar = (a.value - c.value) / (b.value + d.value);
      var qStar = a.value - b.value * pStar;
      var qFromSupply = c.value + d.value * pStar;
      if (!isFinite(pStar) || !isFinite(qStar) || Math.abs(pStar) > sdMax || Math.abs(qStar) > sdMax) {
        showSdError("These numbers do not produce a finite equilibrium price and quantity within 1,000,000,000,000 in absolute value. Use intercepts and slopes closer together.");
        return;
      }

      var choke = a.value / b.value;
      var cs = null;
      var ps = null;
      var psShape = "";
      var supplyIntercept = -c.value / d.value;
      if (pStar > 0 && qStar > 0 && choke > pStar) {
        cs = 0.5 * (choke - pStar) * qStar;
      }
      if (pStar > 0 && qStar > 0) {
        if (c.value > 0) {
          ps = c.value * pStar + 0.5 * d.value * pStar * pStar;
          psShape = "trapezoid";
        } else if (pStar > supplyIntercept) {
          ps = 0.5 * (pStar - supplyIntercept) * qStar;
          psShape = "triangle";
        }
      }
      var total = (cs !== null && ps !== null) ? cs + ps : null;
      var eqFormula =
        "P* = (a " + sdMinus + " c) / (b + d) = " + fmtDiff(a.value, c.value) + " / (" + formatSd(b.value) + " + " + formatSd(d.value) + ") = " +
        formatSd(a.value - c.value) + " / " + formatSd(b.value + d.value) + " = " + formatSd(pStar) + ". " +
        "Q* = a " + sdMinus + " bP* = " + formatSd(a.value) + " " + sdMinus + " " + formatSd(b.value) + " " + sdTimes + " " + formatSd(pStar) + " = " + formatSd(qStar) + ". " +
        "The supply line gives Q* = c + dP* = " + formatSd(c.value) + " + " + formatSd(d.value) + " " + sdTimes + " " + formatSd(pStar) + " = " + formatSd(qFromSupply) + ".";

      if (sdMode === "equilibrium") {
        sdPrimaryBlock.hidden = false;
        sdQuantityBlock.hidden = false;
        sdQdBlock.hidden = true;
        sdQsBlock.hidden = true;
        sdPrimaryLabel.textContent = "Equilibrium price P*";
        sdPrimaryAmount.textContent = formatSd(pStar);
        sdPrimaryDetail.textContent = "This is the price where quantity demanded equals quantity supplied. P* = (a " + sdMinus + " c) / (b + d).";
        sdQuantityLabel.textContent = "Equilibrium quantity Q*";
        sdQuantityAmount.textContent = formatSd(qStar);
        sdQuantityDetail.textContent = "Q* = a " + sdMinus + " bP*. The supply line c + dP* gives " + formatSd(qFromSupply) + ", the same quantity when the division is exact.";
        var surplusShown = false;
        if (cs !== null && ps !== null && total !== null && isFinite(cs) && isFinite(ps) && isFinite(total) && Math.abs(cs) <= sdMax && Math.abs(ps) <= sdMax && Math.abs(total) <= sdMax) {
          surplusShown = true;
          sdCsBlock.hidden = false;
          sdPsBlock.hidden = false;
          sdTsBlock.hidden = false;
          sdCsAmount.textContent = formatSd(cs);
          sdCsDetail.textContent =
            "0.5 " + sdTimes + " (a / b " + sdMinus + " P*) " + sdTimes + " Q* = 0.5 " + sdTimes + " (" + formatSd(choke) + " " + sdMinus + " " + formatSd(pStar) + ") " + sdTimes + " " + formatSd(qStar) + " = " + formatSd(cs) + ". " +
            "The choke price a / b is " + formatSd(choke) + ", where quantity demanded is 0. This is the triangle under the demand line and above P*, out to Q*.";
          sdPsAmount.textContent = formatSd(ps);
          if (psShape === "trapezoid") {
            sdPsDetail.textContent =
              "c is positive, so supply meets the horizontal axis at quantity " + formatSd(c.value) + ". " +
              "Producer surplus is the trapezoid c " + sdTimes + " P* + 0.5 " + sdTimes + " d " + sdTimes + " P* " + sdTimes + " P* = " +
              formatSd(c.value) + " " + sdTimes + " " + formatSd(pStar) + " + 0.5 " + sdTimes + " " + formatSd(d.value) + " " + sdTimes + " " + formatSd(pStar) + " " + sdTimes + " " + formatSd(pStar) + " = " + formatSd(ps) + ". " +
              "The triangle that uses the negative intercept " + formatSd(supplyIntercept) + " would count area below the horizontal axis. This page leaves that area out.";
          } else {
            sdPsDetail.textContent =
              "c is " + (c.value === 0 ? "0" : "negative") + ", so supply meets the vertical axis at price " + formatSd(supplyIntercept) + ". " +
              "Producer surplus is the triangle 0.5 " + sdTimes + " (P* " + sdMinus + " " + formatSd(supplyIntercept) + ") " + sdTimes + " Q* = " + formatSd(ps) + ".";
          }
          sdTsAmount.textContent = formatSd(total);
          sdTsDetail.textContent = "Consumer surplus plus producer surplus: " + formatSd(cs) + " + " + formatSd(ps) + " = " + formatSd(total) + ".";
        } else {
          hideSurplusBlocks();
        }
        sdArithmetic.textContent = eqFormula;
        if (pStar > 0 && qStar > 0 && surplusShown) {
          sdReadNote.textContent =
            "Consumer surplus is an area under demand. Producer surplus is an area above supply. A shortage or a surplus of units is a different idea. Switch to Shortage or surplus and type a price to measure that gap. This is classroom arithmetic, not a forecast and not investment advice.";
        } else if (pStar > 0 && qStar > 0) {
          sdReadNote.textContent =
            "Price and quantity are both positive, but a surplus area is larger than 1,000,000,000,000 in absolute value, so this page skips those figures. Switch to Shortage or surplus to measure a unit gap at a price you type. This is classroom arithmetic, not a forecast and not investment advice.";
        } else {
          sdReadNote.textContent =
            "The lines meet where price or quantity is not positive, so this page skips the usual surplus areas. On a graph, price and quantity usually start at 0. Check the intercepts if you expected a crossing in that region. This is classroom arithmetic, not a forecast and not investment advice.";
        }
        sdSummary.textContent =
          "Qd = " + formatSd(a.value) + " " + sdMinus + " " + formatSd(b.value) + "P. Qs = " + formatSd(c.value) + " + " + formatSd(d.value) + "P. " +
          "P* = " + formatSd(pStar) + ". Q* = " + formatSd(qStar) + ". Educational estimate only. Not a forecast and not investment advice.";
        sdResultEl.classList.add("visible");
        return;
      }

      var p0 = readSdNumber(sdP0El, "the price P0");
      if (!p0.ok) {
        showSdError(p0.message);
        return;
      }
      var qd0 = a.value - b.value * p0.value;
      var qs0 = c.value + d.value * p0.value;
      if (!isFinite(qd0) || !isFinite(qs0) || Math.abs(qd0) > sdMax || Math.abs(qs0) > sdMax) {
        showSdError("Quantity demanded or quantity supplied at this price is outside 1,000,000,000,000 in absolute value. Use a price closer to the intercepts.");
        return;
      }
      var gap = qd0 - qs0;
      var gapWord;
      var gapAmount;
      var gapDetail;
      if (sdNearlyEqual(qd0, qs0)) {
        gapWord = "Equilibrium";
        gapAmount = "0";
        gapDetail = "Quantity demanded equals quantity supplied at this price, so there is no shortage and no surplus. This price clears the market.";
      } else if (qd0 > qs0) {
        gapWord = "Shortage";
        gapAmount = formatSd(qd0 - qs0);
        gapDetail = "Quantity demanded exceeds quantity supplied by " + formatSd(qd0 - qs0) + ". That gap is a shortage of " + formatSd(qd0 - qs0) + ".";
      } else {
        gapWord = "Surplus";
        gapAmount = formatSd(qs0 - qd0);
        gapDetail = "Quantity supplied exceeds quantity demanded by " + formatSd(qs0 - qd0) + ". That gap is a surplus of " + formatSd(qs0 - qd0) + ".";
      }
      sdPrimaryBlock.hidden = false;
      sdQuantityBlock.hidden = true;
      sdQdBlock.hidden = false;
      sdQsBlock.hidden = false;
      hideSurplusBlocks();
      sdPrimaryLabel.textContent = gapWord;
      sdPrimaryAmount.textContent = gapAmount;
      sdPrimaryDetail.textContent = gapDetail;
      sdQdAmount.textContent = formatSd(qd0);
      sdQdDetail.textContent = "Qd0 = a " + sdMinus + " bP0 = " + formatSd(a.value) + " " + sdMinus + " " + formatSd(b.value) + " " + sdTimes + " " + formatSd(p0.value) + " = " + formatSd(qd0) + ".";
      sdQsAmount.textContent = formatSd(qs0);
      sdQsDetail.textContent = "Qs0 = c + dP0 = " + formatSd(c.value) + " + " + formatSd(d.value) + " " + sdTimes + " " + formatSd(p0.value) + " = " + formatSd(qs0) + ".";
      var gapFormula;
      if (sdNearlyEqual(qd0, qs0)) {
        gapFormula = "Qd0 " + sdMinus + " Qs0 = " + formatSd(qd0) + " " + sdMinus + " " + formatSd(qs0) + " = 0, so the market is at equilibrium at this price.";
      } else if (qd0 > qs0) {
        gapFormula = "Shortage = Qd0 " + sdMinus + " Qs0 = " + formatSd(qd0) + " " + sdMinus + " " + formatSd(qs0) + " = " + formatSd(gap) + ".";
      } else {
        gapFormula = "Surplus = Qs0 " + sdMinus + " Qd0 = " + formatSd(qs0) + " " + sdMinus + " " + formatSd(qd0) + " = " + formatSd(-gap) + ".";
      }
      sdArithmetic.textContent =
        "Qd0 = a " + sdMinus + " bP0 = " + formatSd(a.value) + " " + sdMinus + " " + formatSd(b.value) + " " + sdTimes + " " + formatSd(p0.value) + " = " + formatSd(qd0) + ". " +
        "Qs0 = c + dP0 = " + formatSd(c.value) + " + " + formatSd(d.value) + " " + sdTimes + " " + formatSd(p0.value) + " = " + formatSd(qs0) + ". " +
        gapFormula + " For the same lines, " + eqFormula;
      if (pStar > 0 && qStar > 0) {
        if (sdNearlyEqual(p0.value, pStar)) {
          sdReadNote.textContent = "This price matches the equilibrium price for these lines, " + formatSd(pStar) + ", and the equilibrium quantity is " + formatSd(qStar) + ". Consumer surplus and producer surplus are the equilibrium areas in the other mode. This is classroom arithmetic, not a forecast and not investment advice.";
        } else if (p0.value < pStar) {
          sdReadNote.textContent = "This price is below the equilibrium price of " + formatSd(pStar) + " (quantity " + formatSd(qStar) + "). With the usual slopes and a crossing where price and quantity are both positive, a lower price leaves a shortage. This is classroom arithmetic, not a forecast and not investment advice.";
        } else {
          sdReadNote.textContent = "This price is above the equilibrium price of " + formatSd(pStar) + " (quantity " + formatSd(qStar) + "). With the usual slopes and a crossing where price and quantity are both positive, a higher price leaves a surplus. This is classroom arithmetic, not a forecast and not investment advice.";
        }
      } else {
        sdReadNote.textContent = "These lines meet at price " + formatSd(pStar) + " and quantity " + formatSd(qStar) + ", outside the region where both are positive. Read the gap from the two quantities above. This is classroom arithmetic, not a forecast and not investment advice.";
      }
      if (qd0 < 0 || qs0 < 0) {
        sdReadNote.textContent += " A negative quantity means the straight line has crossed an axis. A market graph usually stops at 0.";
      }
      sdSummary.textContent =
        "At price " + formatSd(p0.value) + ", Qd = " + formatSd(qd0) + " and Qs = " + formatSd(qs0) + ". " +
        gapDetail + " Educational estimate only. Not a forecast and not investment advice.";
      sdResultEl.classList.add("visible");
    }
    function setSdMode(mode) {
      sdMode = mode;
      sdPriceFields.hidden = mode !== "gap";
      var activeBtn = mode === "gap" ? sdModeGapBtn : sdModeEquilibriumBtn;
      var hint = "Equilibrium. Enter Qd = a \u2212 bP and Qs = c + dP. The page solves for the price and quantity where the lines meet, then the consumer surplus and producer surplus areas when price and quantity are both positive.";
      if (mode === "gap") {
        hint = "Shortage or surplus. Uses the same two lines. Type a price P0. The page computes quantity demanded and quantity supplied at that price. If buyers want more than sellers offer, the gap is a shortage. If sellers offer more than buyers want, the gap is a surplus. If the quantities match, that price is an equilibrium.";
      }
      var i;
      for (i = 0; i < sdModeButtons.length; i++) {
        var on = sdModeButtons[i] === activeBtn;
        sdModeButtons[i].className = on ? "btn" : "btn btn-secondary";
        sdModeButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      sdModeHint.textContent = hint;
      runSupplyDemand();
    }

    sdModeEquilibriumBtn.addEventListener("click", function () {
      setSdMode("equilibrium");
    });
    sdModeGapBtn.addEventListener("click", function () {
      setSdMode("gap");
    });
    supplyDemandBtn.addEventListener("click", runSupplyDemand);
    var sdInputIndex;
    for (sdInputIndex = 0; sdInputIndex < sdInputs.length; sdInputIndex++) {
      sdInputs[sdInputIndex].addEventListener("input", runSupplyDemand);
    }
    if (sdResetBtn) {
      sdResetBtn.addEventListener("click", function () {
        sdAEl.value = "100";
        sdBEl.value = "2";
        sdCEl.value = "10";
        sdDEl.value = "1";
        sdP0El.value = "20";
        setSdMode("equilibrium");
      });
    }
    setSdMode("equilibrium");
  }
})();
