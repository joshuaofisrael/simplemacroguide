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
})();
