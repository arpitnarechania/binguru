/***********************************************************
// Filename: index.ts
// Purpose: Main entrypoint for the BinGuru Javascript library.
**********************************************************/


import * as ss from 'simple-statistics';
import nerdamer from 'nerdamer/nerdamer.core.js';
import 'nerdamer/Algebra.js';
import 'nerdamer/Calculus.js';
import 'nerdamer/Solve.js';


export const EQUAL_INTERVAL = "equalInterval";
export const PERCENTILE = "percentile";
export const DEFINED_INTERVAL = "definedInterval";
export const QUANTILE = "quantile";
export const BOXPLOT = "boxPlot";
export const STANDARD_DEVIATION = "standardDeviation";
export const MAXIMUM_BREAKS = "maximumBreaks";
export const PRETTY_BREAKS = "prettyBreaks";
export const CK_MEANS = "ckMeans";
export const HEAD_TAIL_BREAKS = "headTailBreaks";
export const FISHER_JENKS = "fisherJenks";
export const EXPONENTIAL_BIN_SIZE = "exponentialBinSizes";
export const GEOMETRIC_INTERVAL = "geometricInterval";
export const LOGARITHMIC_INTERVAL = "logarithmicInterval";
export const UNCLASSED = "unclassed";
export const UNIQUE = "unique";
export const MANUAL_INTERVAL = "manualInterval";
export const RESILIENCY = "resiliency";

export class BinGuru {

  rawData: any[];
  binCount: number;
  binExtent: number;
  precision: number;

  data: number[];
  minSortedData: number[];
  maxSortedData: number[];

  median: number;
  mean: number;
  sd: number;
  iqr: number;
  lq1: number;
  lq10: number;
  lq25: number;
  uq75: number;
  uq90: number;
  uq99: number;
  min: number;
  max: number;
  nonZeroMin: number;

  visModel = {};

  constructor(rawData = [], binCount = 5, binExtent = 10, precision = 2) {

    // Set input params
    this.rawData = rawData;
    this.binCount = binCount;
    this.binExtent = binExtent;
    this.precision = precision;

    // Process Data
    this.data = this.rawData.filter(value => this.isValid(value)); // only work with non NaN, non null, non undefined, numeric data
    this.minSortedData = JSON.parse(JSON.stringify(this.data)).sort((n1: number, n2: number) => n1 - n2);
    this.maxSortedData = JSON.parse(JSON.stringify(this.data)).sort((n1: number, n2: number) => n2 - n1);

    // Compute Basic Stats
    this.median = ss.median(this.data);
    this.mean = ss.mean(this.data);
    this.sd = ss.standardDeviation(this.data);
    this.iqr = ss.interquartileRange(this.data);
    this.lq1 = ss.quantile(this.data, 0.01);
    this.lq10 = ss.quantile(this.data, 0.10);
    this.lq25 = ss.quantile(this.data, 0.25);
    this.uq75 = ss.quantile(this.data, 0.75);
    this.uq90 = ss.quantile(this.data, 0.90);
    this.uq99 = ss.quantile(this.data, 0.99);
    [this.min, this.max] = ss.extent(this.data)
    this.nonZeroMin = Math.min.apply(null, this.data.filter(Boolean));

    // Round off everything to 2 digits.
    this.median = parseFloat(this.median.toFixed(2));
    this.mean = parseFloat(this.mean.toFixed(2));
    this.sd = parseFloat(this.sd.toFixed(2));
    this.iqr = parseFloat(this.iqr.toFixed(2));
    this.lq1 = parseFloat(this.lq1.toFixed(2));
    this.lq10 = parseFloat(this.lq10.toFixed(2));
    this.lq25 = parseFloat(this.lq25.toFixed(2));
    this.uq75 = parseFloat(this.uq75.toFixed(2));
    this.uq90 = parseFloat(this.uq90.toFixed(2));
    this.uq99 = parseFloat(this.uq99.toFixed(2));
    [this.min, this.max] = [this.min, this.max].map((item) => parseFloat(item.toFixed(2)));
    this.nonZeroMin = parseFloat(this.nonZeroMin.toFixed(2));
  }

  /**
   * Return most frequently occurring element in the array.
   */
  getMostFrequentElement(array: number[]) {
    const store: any = {};
    array.forEach((num: number) => store[num] ? store[num] += 1 : store[num] = 1);
    return parseInt(Object.keys(store).sort((a, b) => store[b] - store[a])[0]);
  }

  /**
   * Return frequency of most frequently occurring element in the array.
   */
  getFrequencyOfMostFrequentElement(array: number[]) {
    var mp = new Map();
    var n = array.length;

    // Traverse through array elements and
    // count frequencies
    for (var i = 0; i < n; i++) {
      if (mp.has(array[i]))
        mp.set(array[i], mp.get(array[i]) + 1)
      else
        mp.set(array[i], 1)
    }

    var keys: any = [];
    mp.forEach((value, key) => {
      keys.push(key);
    });
    keys.sort((a: number, b: number) => a - b);

    // Traverse through map and print frequencies
    let max = -Infinity;
    keys.forEach((key: string) => {
      let val = mp.get(key);
      if (val > max) {
        max = val;
      }
    });

    return max;
  }


  /**
   * Maximum Breaks
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  maximumBreaks() {
    let context = this;
    let binBreaks: number[] = [];

    // compute the differences between adjacent array elements in the sorted version of the data.
    let diffs: number[] = [];
    for (var i = 0; i < context.minSortedData.length - 1; i++) {
      const diff = context.minSortedData[i + 1] - context.minSortedData[i];
      diffs.push(diff);
    }

    // note the corresponding indices of the element diffs that is sorted in the descending order by their diff.
    var len = diffs.length;
    var indices = new Array(len);
    for (var i = 0; i < len; ++i) indices[i] = i;
    indices.sort(function (a, b) { return diffs[a] < diffs[b] ? 1 : diffs[a] > diffs[b] ? -1 : 0; }); // descending order

    // Next, choose the top `noOfBreaks` (or binCount-1)
    // Note: do index + 1 - because `threshold` scale binBreaks has < upper limit and not <= upper limit.
    for (let i = 0; i < (context.binCount - 1); i++) {
      binBreaks.push(context.minSortedData[indices[i] + 1]);
    }
    binBreaks = binBreaks.sort(function (a, b) { return a - b; }); // Need to sort it back to ascending order;

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": context.binCount,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Head Tail Breaks
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  headTailBreaks() {
    let context = this;
    let binBreaks: number[] = [];

    function recursive(data: number[]) {
      let data_mean: number = data.reduce(function (a, b) { return a + b }) / data.length;
      let head = data.filter(function (d) { return d > data_mean });
      binBreaks.push(data_mean);

      while (head.length > 1 && head.length / data.length < 0.40) {
        return recursive(head);
      };
    }
    recursive(context.maxSortedData);

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * ckMeans
   * Description: The heuristic k-means algorithm, widely used for cluster analysis, does not guarantee optimality. CKMeans is a dynamic programming algorithm for optimal one-dimensional clustering.
   * URL: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5148156/
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  ckMeans() {
    let context = this;
    let binBreaks: number[] = []

    let clusters = ss.ckmeans(context.data, context.binCount);
    binBreaks = clusters.map(function (cluster: number[]) {
      return cluster[cluster.length - 1]; // Last element of each cluster is the bin's upper limit;
    });
    binBreaks = binBreaks.slice(0, -1); // Delete the last element.

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }
  }

  /**
   * Equal Interval
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  equalInterval() {
    let context = this;
    let binBreaks: number[] = [];
    let binExtent = (context.max - context.min) / context.binCount;
    for (let i = 0; i < (context.binCount - 1); i++) {
      let value = context.min + binExtent * (i + 1);
      binBreaks.push(value);
    }

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": context.binCount,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }
  }

  /**
   * Percentile
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  percentile() {
    let context = this;
    let binBreaks = [
      context.lq1 + Number.EPSILON, // Epsilon is added because the first binBreak must include 1% or lower.
      context.lq10,
      context.median,
      context.uq90,
      context.uq99
    ];

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Quantile
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  quantile() {
    let context = this;
    let binBreaks: number[] = [];
    const indexIncrement = Math.floor(context.minSortedData.length / context.binCount);
    for (let i = 1; i < context.binCount; i++) {
      let value = context.minSortedData[indexIncrement * i];
      binBreaks.push(value);
    }

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Mean - Standard Deviation
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  standardDeviation() {
    let context = this;
    let binBreaks: number[] = [];
    let binCount = context.binCount; // We create a copy of binCount because we modify it for a specific case (when it is a odd number) but we don't want to update the global setting. 

    // If there are even binCount
    let minStart = 0;
    let increment = 0;
    if (binCount % 2 == 0) {
      minStart = context.mean - (context.sd * (binCount / 2 - 1));
      increment = context.sd; // 1 standard deviation
    } else {
      // minStart = mean - (sd * ((binCount - 1) / 2) / 2);
      // increment = sd / 2; // 0.5 standard deviation
      binCount++;
      minStart = context.mean - (context.sd * (binCount / 2 - 1));
      increment = context.sd; // 1 standard deviation
    }
    for (let i = 0; i < (binCount - 1); i++) {
      let value = minStart + increment * i;
      binBreaks.push(value);
    }

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Manual Interval, similar to User Defined
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  manualInterval() {
    let context = this;

    // let binBreaks = [context.mean - (context.mean - context.min) / 2, context.mean + (context.max - context.mean) / 2];
    let binBreaks = [70, 80, 90];

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Pretty Breaks
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  prettyBreaks() {
    let context = this;
    let binBreaks: number[] = [];
    if (context.binCount == 1) {
      binBreaks = [];
    } else if (context.binCount == 2) {
      binBreaks = [parseFloat(context.mean.toPrecision(2))];
    } else {
      let binExtent = (context.max - context.min) / context.binCount;
      for (let i = 0; i < (context.binCount - 1); i++) {
        let value = parseFloat((context.min + binExtent * (i + 1)).toPrecision(2));
        binBreaks.push(value);
      }
    }
    // return [10, 20, 30, 40]
    binBreaks = [...new Set(binBreaks)]; // converting it into a set and then into an array because sometimes during prettification, we may end up with same breaks.

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, 0),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Box Plot
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  boxPlot() {
    let context = this;
    const h = 1.5; // `hinge` for determining outliers (the whiskers). You can change the default of 1.5.
    // binSize is fixed in this case = 6
    let binBreaks = [
      context.lq25 - h * context.iqr,
      context.lq25,
      context.median,
      context.uq75,
      context.uq75 + h * context.iqr
    ];

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Defined Interval
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  definedInterval() {
    let context = this;
    let binBreaks: number[] = [];
    let binCount = 1; // binCount is hard-coded here.
    while (context.min + (context.binExtent * binCount) < context.max) {
      binBreaks.push(context.min + context.binExtent * binCount);
      binCount++;
    }

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }
  }

  /**
   * Geometric Interval
   * Source: `A Python Script for Geometric Interval binning method in QGIS: A Useful Tool for Archaeologists`
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  geometricInterval() {
    let context = this;
    let binBreaks: number[] = [];
    // If min is 0, then the multiplier will turn out to be Infinity; hence we then start from the nonZeroMin as the start.
    // An alternative could be Number.EPSILON as it is the smallest value above 0 but it seems to be resulting in weird results.
    // ToDo: How does a geometric sequence update when both negative and positive values exist; what is the multiplier in those cases?
    let seriesStartVal = context.min == 0 ? context.nonZeroMin : context.min;
    let multiplier = Math.pow(context.max / seriesStartVal, 1 / context.binCount);

    // The formula defines bins' upper limits;
    // Hence, we run it only until noOfBreaks = (binCount - 1)
    for (let i = 0; i < (context.binCount - 1); i++) {
      let value = seriesStartVal * Math.pow(multiplier, i + 1);
      binBreaks.push(value);
    }

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }
  }


  /**
   * Logarithmic Interval
   * Intervals grow exponentially, based on a logarithmic scale, to accommodate a wide range of data values and emphasize relative differences at both small and large scales.
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  logarithmicInterval(logBase: number | string = 'auto') {
    let context = this;
    let binBreaks: number[] = [];
    let binBreak: number = context.min;

    // Calculate the logarithmic base
    if (logBase == "auto") {

      // Calculate the logarithmic base from the data extent and desired bin count
      logBase = Math.pow((context.max / context.min), (1 / context.binCount));

      // Generate the bin boundaries using the logarithmic scale
      for (let i = 0; i < context.binCount; i++) {
        if (i != 0) binBreaks.push(binBreak);
        binBreak *= logBase;
      }
    } else {

      // Calculate the logarithmic interval size
      const logIntervalSize = (Math.log10(context.max) - Math.log10(context.min)) / context.binCount;

      for (let i = 0; i < context.binCount; i++) {
        if (i != 0) binBreaks.push(binBreak);
        binBreak *= Math.pow(10, logIntervalSize);
      }
    }

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }
  }

  /**
   * Exponential Bin Size
   * Intervals are selected so that the number of observations in each successive interval increases (or decreases) exponentially
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  exponentialBinSizes() {
    let context = this;
    let binBreaks: number[] = [];

    const firstBinSize = 1; // Heuristic
    const seriesSum = context.minSortedData.length;
    const equation = firstBinSize.toString() + ' * (1 - x^' + context.binCount.toString() + ') = ' + seriesSum.toString() + ' * (1 - x)';
    const solutions = nerdamer.solveEquations(equation, 'x').map((solution: any) => nerdamer(solution).evaluate().text());
    let commonRatio = 1;

    for (let i = 0; i < solutions.length; i++) {
      try {
        let numericSolution = parseFloat(solutions[i]);
        if (numericSolution != 1) {
          commonRatio = numericSolution;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    // If commonRatio is still 1, then there is no geometric, exponential series.
    if (commonRatio == 1) {
      return [];
    } else {

      let cumulativeSizeBins = 0;
      for (let i = 0; i < context.binCount - 1; i++) {

        // Size of Nth bin (beginning from firstBinSize and then increasing based on commonRatio)
        let nthBinSize = firstBinSize * (Math.pow(commonRatio, i));

        // Compute Running Sum of number of items covered.
        cumulativeSizeBins += nthBinSize;

        // Element Index
        const elementIndex = Math.floor(cumulativeSizeBins);

        // Bin Break
        const binBreak = context.minSortedData[elementIndex - 1]; // -1 as count and index are off by 1.

        // Push the value for the binBreak to the binBreaks array.
        binBreaks.push(binBreak);
      }
    }

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }
  }

  /**
   * Fisher Jenks
   * URL: http://en.wikipedia.org/wiki/Jenks_natural_breaks_optimization
   * Implementations: [1](http://danieljlewis.org/files/2010/06/Jenks.pdf) (python),
   * [2](https://github.com/vvoovv/djeo-jenks/blob/master/main.js) (buggy),
   * [3](https://github.com/simogeo/geostats/blob/master/lib/geostats.js#L407) (works)
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  fisherJenks() {
    let context = this;
    // Compute the matrices required for Jenks breaks. These matrices
    // can be used for any binning of data with `bins <= binCount`
    function getMatrices(data: number[], binCount: number) {

      // in the original implementation, these matrices are referred to
      // as `LC` and `OP`
      //
      // * lower_bin_limits (LC): optimal lower bin limits
      // * variance_combinations (OP): optimal variance combinations for all bins
      var lower_bin_limits: number[][] = [],
        variance_combinations: number[][] = [],
        // loop counters
        i, j,
        // the variance, as computed at each step in the calculation
        variance = 0;

      // Initialize and fill each matrix with zeroes
      for (i = 0; i < data.length + 1; i++) {
        var tmp1: number[] = [], tmp2: number[] = [];
        for (j = 0; j < binCount + 1; j++) {
          tmp1.push(0);
          tmp2.push(0);
        }
        lower_bin_limits.push(tmp1);
        variance_combinations.push(tmp2);
      }

      for (i = 1; i < binCount + 1; i++) {
        lower_bin_limits[1][i] = 1;
        variance_combinations[1][i] = 0;
        // in the original implementation, 9999999 is used but
        // since Javascript has `Infinity`, we use that.
        for (j = 2; j < data.length + 1; j++) {
          variance_combinations[j][i] = Infinity;
        }
      }

      for (var l = 2; l < data.length + 1; l++) {

        // `SZ` originally. this is the sum of the values seen thus
        // far when calculating variance.
        var sum = 0,
          // `ZSQ` originally. the sum of squares of values seen
          // thus far
          sum_squares = 0,
          // `WT` originally. This is the number of
          w = 0,
          // `IV` originally
          i4 = 0;

        // in several instances, you could say `Math.pow(x, 2)`
        // instead of `x * x`, but this is slower in some browsers
        // introduces an unnecessary concept.
        for (var m = 1; m < l + 1; m++) {

          // `III` originally
          var lower_bin_limit = l - m + 1,
            val = data[lower_bin_limit - 1];

          // here we're estimating variance for each potential binning
          // of the data, for each potential number of bins. `w`
          // is the number of data points considered so far.
          w++;

          // increase the current sum and sum-of-squares
          sum += val;
          sum_squares += val * val;

          // the variance at this point in the sequence is the difference
          // between the sum of squares and the total x 2, over the number
          // of samples.
          variance = sum_squares - (sum * sum) / w;

          i4 = lower_bin_limit - 1;

          if (i4 !== 0) {
            for (j = 2; j < binCount + 1; j++) {
              // if adding this element to an existing bin
              // will increase its variance beyond the limit, break
              // the bin at this point, setting the lower_bin_limit
              // at this point.
              if (variance_combinations[l][j] >=
                (variance + variance_combinations[i4][j - 1])) {
                lower_bin_limits[l][j] = lower_bin_limit;
                variance_combinations[l][j] = variance +
                  variance_combinations[i4][j - 1];
              }
            }
          }
        }

        lower_bin_limits[l][1] = 1;
        variance_combinations[l][1] = variance;
      }

      // return the two matrices. for just providing breaks, only
      // `lower_bin_limits` is needed, but variances can be useful to
      // evaluage goodness of fit.
      return {
        lower_bin_limits: lower_bin_limits,
        variance_combinations: variance_combinations
      };
    }

    // the second part of the jenks recipe: take the calculated matrices
    // and derive an array of n breaks.
    function breaks(data: number[], lower_bin_limits: number[][], binCount: number) {

      var k = data.length - 1,
        kbin: number[] = [],
        countNum = binCount;

      // the calculation of bins will never include the upper and
      // lower bounds, so we need to explicitly set them
      kbin[binCount] = data[data.length - 1];
      kbin[0] = data[0];

      // the lower_bin_limits matrix is used as indexes into itself
      // here: the `k` variable is reused in each iteration.
      while (countNum > 1) {
        kbin[countNum - 1] = data[lower_bin_limits[k][countNum] - 2];
        k = lower_bin_limits[k][countNum] - 1;
        countNum--;
      }

      return kbin;
    }

    if (context.binCount > context.data.length) return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": null,
      "binBreaks": [],
      "binSizes": { "valids": null, "invalids": null },
      "dataBinAssignments": {}
    };

    // sort data in numerical order, since this is expected
    // by the matrices function
    context.data = context.data.slice().sort(function (a, b) { return a - b; });

    // get our basic matrices
    var matrices = getMatrices(context.data, context.binCount),
      // we only need lower bin limits here
      lower_bin_limits = matrices.lower_bin_limits;

    // extract binCount out of the computed matrices
    const allBreaks = breaks(context.data, lower_bin_limits, context.binCount);

    let binBreaks = allBreaks.slice(1).slice(0, -1); // this removes the first and last elements of the array because we just need the middle breaks; the `min` and `max` are implicitly inferred any way.

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }


  /**
   * Unique
   * This method treats each continuous data value as categorical and maps each unique bin of equal values to a distinct color
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  unique() {
    let context = this;
    const binBreaks: number[] = Array.from(new Set(context.minSortedData));

    // Compute Bin Sizes
    const binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    const dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }


  /**
   * Unclassed
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  unclassed() {
    let context = this;
    const binBreaks: number[] = [context.min, context.max];

    // Compute Bin Sizes
    const binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    const dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": null,
      "binBreaks": [],
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments
    }

  }

  /**
   * Resiliency
   * @returns { binCount: number, binBreaks: number[], binSizes: object, dataRange: number[], dataBinAssignments: object }
   */
  resiliency(binningMethods = []) {
    let context = this;
    let binBreaks: number[] = [];

    // Data structure to store the binObj corresponding to each binningMethod.
    let binObjs: any = {};

    binningMethods.forEach(function (binningMethod) {
      let binObj: any = {};
      switch (binningMethod) {
        case EQUAL_INTERVAL:
          binObj = context.equalInterval();
          binObjs[EQUAL_INTERVAL] = JSON.parse(JSON.stringify(binObj));
          break;

        case PERCENTILE:
          binObj = context.percentile();
          binObjs[PERCENTILE] = JSON.parse(JSON.stringify(binObj));
          break;

        case QUANTILE:
          binObj = context.quantile();
          binObjs[QUANTILE] = JSON.parse(JSON.stringify(binObj));
          break;

        case STANDARD_DEVIATION:
          binObj = context.standardDeviation();
          binObjs[STANDARD_DEVIATION] = JSON.parse(JSON.stringify(binObj));
          break;

        case MANUAL_INTERVAL:
          binObj = context.manualInterval();
          binObjs[MANUAL_INTERVAL] = JSON.parse(JSON.stringify(binObj));
          break;

        case PRETTY_BREAKS:
          binObj = context.prettyBreaks();
          binObjs[PRETTY_BREAKS] = JSON.parse(JSON.stringify(binObj));
          break;

        case MAXIMUM_BREAKS:
          binObj = context.maximumBreaks();
          binObjs[MAXIMUM_BREAKS] = JSON.parse(JSON.stringify(binObj));
          break;

        case HEAD_TAIL_BREAKS:
          binObj = context.headTailBreaks();
          binObjs[HEAD_TAIL_BREAKS] = JSON.parse(JSON.stringify(binObj));
          break;

        case CK_MEANS:
          binObj = context.ckMeans();
          binObjs[CK_MEANS] = JSON.parse(JSON.stringify(binObj));
          break;

        case BOXPLOT:
          binObj = context.boxPlot();
          binObjs[BOXPLOT] = JSON.parse(JSON.stringify(binObj));
          break;

        case DEFINED_INTERVAL:
          binObj = context.definedInterval();
          binObjs[DEFINED_INTERVAL] = JSON.parse(JSON.stringify(binObj));
          break;

        case EXPONENTIAL_BIN_SIZE:
          binObj = context.exponentialBinSizes();
          binObjs[EXPONENTIAL_BIN_SIZE] = JSON.parse(JSON.stringify(binObj));
          break;

        case LOGARITHMIC_INTERVAL:
          binObj = context.logarithmicInterval();
          binObjs[LOGARITHMIC_INTERVAL] = JSON.parse(JSON.stringify(binObj));
          break;

        case GEOMETRIC_INTERVAL:
          binObj = context.geometricInterval();
          binObjs[GEOMETRIC_INTERVAL] = JSON.parse(JSON.stringify(binObj));
          break;

        case FISHER_JENKS:
          binObj = context.fisherJenks();
          binObjs[FISHER_JENKS] = JSON.parse(JSON.stringify(binObj));
          break;

        default:
          binObj = {
            "rawData": context.rawData,
            "data": context.data,
            "dataRange": [context.min, context.max],
            "binCount": null,
            "binBreaks": [],
            "binSizes": { "valids": null, "invalids": null },
            "dataBinAssignments": {}
          };
          binObjs["default"] = JSON.parse(JSON.stringify(binObj));
      }
    });

    let frequencyOfMostFrequentBins: any = {};
    let mostFrequentBins: any = {};

    context.rawData.forEach(function (val, valindex) {
      // Let the primary key be index of the item in the rawDataArray.
      let primaryKey = valindex.toString();
      if (context.isValid(val)) {
        let binAssignmentsForPrimaryKey = Array.from(Object.values(binObjs)).map((binObj: any) => binObj["dataBinAssignments"][primaryKey]);
        if (!(primaryKey in frequencyOfMostFrequentBins)) {
          frequencyOfMostFrequentBins[primaryKey] = 0;
        }
        frequencyOfMostFrequentBins[primaryKey] = context.getFrequencyOfMostFrequentElement(binAssignmentsForPrimaryKey);
        if (!(primaryKey in mostFrequentBins)) {
          mostFrequentBins[primaryKey] = 0;
        }
        mostFrequentBins[primaryKey] = context.getMostFrequentElement(binAssignmentsForPrimaryKey);
      }
    });
    

    // Compute Data for Resiliency
    let resiliencyData: object[] = [];
    Object.keys(frequencyOfMostFrequentBins).forEach(function (primaryKey, valindex) {
      let obj: any = {};
      obj["primaryKey"] = primaryKey;
      obj["value"] = context.rawData[valindex];
      obj["binCandidates"] = [];

      binningMethods.forEach(function (binningMethod) {
        obj["binCandidates"].push(JSON.parse(JSON.stringify(binObjs[binningMethod]["dataBinAssignments"][primaryKey])));
      });
      resiliencyData.push(obj);
    });

    let itemwiseBinPriorities: any = {};
    let itemwiseBinPriorityWeights: any = {};

    resiliencyData.forEach(function (d: any) {
      itemwiseBinPriorities[d["primaryKey"]] = [];
      itemwiseBinPriorityWeights[d["primaryKey"]] = [];

      let arr = [...d["binCandidates"]];
      while (arr.length > 0) {
        const mostFrequentElement = context.getMostFrequentElement(arr);
        const frequencyOfMostFrequentElement = context.getFrequencyOfMostFrequentElement(arr);

        // Trim the `arr' to now find the next mostFrequentElement and frequencyOfMostFrequentElement.
        arr = arr.filter(function (item) { return item !== mostFrequentElement });

        // Add to the priority lists
        itemwiseBinPriorities[d["primaryKey"]].push(mostFrequentElement);
        itemwiseBinPriorityWeights[d["primaryKey"]].push(frequencyOfMostFrequentElement);
      }
    });

    // Now, iterate through the TOP priority bins for all data items and put them into those bins.

    // Then, compute the min-max of these bins OR basically, determine if they are in an AP. 
    // If they are in an arithmetic progression, well and good. 
    // If not, there is a need to deprioritize the preferences of the boundary data items and reclassify them to their next best bin priority.
    // Keep doing this until there is a solution.

    let binInfo: any = {};
    let priorityBins: number[] = [];
    resiliencyData.forEach(function (d: any) {
      let priorityBin = itemwiseBinPriorities[d["primaryKey"]][0]; // First element is highest priority.
      if (!(priorityBin in binInfo)) {
        binInfo[priorityBin] = [];
        priorityBins.push(priorityBin);
      }
      binInfo[priorityBin].push(d["value"]);
    });

    // Sort priorityBins from something like [3, 2, 4, 5, 1] to [1, 2, 3, 4, 5] (No harm in doing this)
    priorityBins = priorityBins.sort((n1, n2) => n1 - n2);

    // Sort within the priority bins
    priorityBins.forEach(function (priorityBin, valindex) {
      binInfo[priorityBin] = binInfo[priorityBin].sort((n1: number, n2: number) => n1 - n2);

      // The first item from the 2nd bin onwards would be the binBreaks.
      // TODO: Consideration: Instead of taking the FIRST element of the 2nd item (or the last element of the 1st item), consider taking the AVERAGE of the two! Might be very interesting as they will absolutely ensure the respective points eventually end up in the appropriate bin, i.e., not get into > or >= dilemmas.
      if (valindex > 0) {
        binBreaks.push(binInfo[priorityBin][0]);
      }
    });

    // New: Round all binBreaks
    binBreaks = binBreaks.map((item) => parseFloat(item.toFixed(2)));
    binBreaks = binBreaks.sort((n1, n2) => n1 - n2);

    // Compute Bin Sizes
    let binSizes = context.computeBinSizes(binBreaks);

    // Compute Data-> Bin Assignments
    let dataBinAssignments = context.computeDataBinAssignments(binBreaks);

    // Return final Bin Object
    return {
      "rawData": context.rawData,
      "data": context.data,
      "dataRange": [context.min, context.max],
      "binCount": binBreaks.length + 1,
      "binBreaks": context.roundToPrecision(binBreaks, context.precision),
      "binSizes": binSizes,
      "dataBinAssignments": dataBinAssignments,
      "binObjs": binObjs,
      "mostFrequentBins": mostFrequentBins,
      "frequencyOfMostFrequentBins": frequencyOfMostFrequentBins
    };
  }

  // Compute Bin Size from Bin Breaks
  computeBinSizes(binBreaks: number[]) {
    let context = this;

    // Reset Bin Sizes;
    let binSizes: any = {};
    let invalids: number = 0;

    // Iterate through all values for the current feature/attribute.
    // Where to put NaNs / nulls? For now, just ignore them; we need valindex hence still need to iterate over all.
    context.rawData.forEach(function (val, valindex) {
      if (context.isValid(val)) {

        // We want 1 index, not 0 index.
        let binID = 1;
        if (!(binID in binSizes)) {
          binSizes[binID] = 0;
        }
        for (let i = binID; i < binBreaks.length + 1; i++) {
          if (binBreaks[i - 1] <= val) {
            binID = i + 1;
            if (!(binID in binSizes)) {
              binSizes[binID] = 0;
            }
          }
        }

        // Increment the binSizes counter for each binIndex.
        binSizes[binID] += 1;

      }
      else {
        invalids++;
      }
    });

    return { "valids": binSizes, "invalids": invalids };
  }

  // Compute Data -> Bin Assignments from Bin Breaks
  computeDataBinAssignments(binBreaks: number[]) {
    let context = this;

    let dataBinAssignments: any = {};

    // Iterate through all values for the current feature/attribute.
    // Where to put NaNs / nulls? For now, just ignore them; we need valindex hence still need to iterate over all.
    context.rawData.forEach(function (val, valindex) {
      // Let the primary key be index of the item in the rawDataArray.
      let primaryKey = valindex.toString();

      if (context.isValid(val)) {

        // We want 1 index, not 0 index.
        let binID = 1;
        for (let i = binID; i < binBreaks.length + 1; i++) {
          if (binBreaks[i - 1] < val) {
            binID = i + 1;
          }
        }
        // Assign the binId (indexed at 1) to the primaryKey
        dataBinAssignments[primaryKey] = binID;
      } else {
        // For invalid values, the binID will be null, by design choice.
        dataBinAssignments[primaryKey] = null;
      }
    });

    return dataBinAssignments;
  }

  /*
  * Return true if the input entity is a valid number and false otherwise.
  */
  isValid(val: any) {
    return (val != undefined && val != null && val.toString().length > 0 && val.toString().match(/[^0-9\.\-]/g) == null && !Number.isNaN(Number(val)));
  }

  /*
  * Round array items
  */
  roundToPrecision(array: number[], precision = 2) {
    return array.map((item) => parseFloat(item.toFixed(precision)));
  }


  /*
  * Create a legend-like visualization showing the bin intervals, counts, sizes. Currently using Vega-Lite.
  */
  visualize(binguruRes: any, binningMethodName: string, colorSchemeCode = "viridis") {
    let context = this;
    /** 
     * Important match because `boxPlot` and `standardDeviation` are such that their extents can cross the dataMin and dataMax. 
     * Hence, compute [binMin, binMax]
     */
    let dataMin = context.min;
    let dataMax = context.max;
    let binBreaks = binningMethodName == UNCLASSED ? binguruRes["dataRange"] : binguruRes["binBreaks"];
    let [binMin, binMax] = [Infinity, -Infinity];
    for (var i = 0; i < binBreaks.length; i++) {
      let val = binBreaks[i];
      if (binMin > val) {
        binMin = val;
      }
      if (binMax < val) {
        binMax = val;
      }
    }
    if (binMin > dataMin) {
      binMin = dataMin;
    }
    if (binMax < dataMax) {
      binMax = dataMax;
    }

    let data: object[] = [];
    let dataTicks: number[] = [];
    let binSizes = context.computeBinSizes(binBreaks);
    let validBinSizes = binSizes["valids"];
    let invalidBinSizes = binSizes["invalids"];

    for (var i = 0; i <= binBreaks.length; i++) {
      let obj: any = {};
      let binID = (i + 1).toString();
      if (i == 0) {
        obj["binMin"] = binMin;
        obj["binMax"] = binBreaks[i];

        // Add first binMin
        if (!isNaN(obj["binMin"])) {
          dataTicks.push(obj["binMin"]);
        }
      }
      else if (i <= binBreaks.length - 1) {
        obj["binMin"] = binBreaks[i - 1];
        obj["binMax"] = binBreaks[i];
      }
      else {
        obj["binMin"] = binBreaks[i - 1];
        obj["binMax"] = binMax;
      }
      obj["binningMethod"] = binningMethodName;
      obj["binID"] = binID.toString();
      obj["binSize"] = validBinSizes[binID];

      // Add all binEnds
      if (!isNaN(obj["binMax"])) {
        dataTicks.push(obj["binMax"]);
      }
      data.push(obj);
    }

    const specConstants = {
      width: 700,
      height: 50
    }

    let vlSpec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "width": specConstants.width,
      "height": specConstants.height,
      "background": null,
      "config": {
        "tick": {
          "bandSize": 20
        },
        "view": { "stroke": null },
        "axis": {
          "domain": false, "grid": false, "ticks": false
        }
      },
      "layer": [{
        "title": null,
        "data": {
          "values": data
        },
        "mark": {
          "type": "bar",
          "tooltip": { "content": "data" }
        } as any,
        "transform": [{
          "filter": "datum.binSize != 0"
        }],
        "encoding": {
          "x": { "field": "binMin", "type": "quantitative", "axis": { "title": null, "values": binBreaks, "format": ".2f", "labelFontSize": 16 }, "scale": { "domain": [binMin, binMax] } },
          "y": {
            "field": "binningMethod", "type": "ordinal", "axis": {
              "title": null,
              // "labelFontSize": 16, 
              // "labelLimit": 250, 
              // "labelPadding": 10,
              "labels": false
            }
          },
          "x2": {
            "field": "binMax", "scale": { "domain": [binMin, binMax] }, "axis": {
              "format": ".2f",
              "labelFontSize": 16
            }
          },
          "size": {
            "field": "binSize",
            "legend": null,
            // "legend": {
            //   "titleFontSize": 22,
            //   "labelFontSize": 18,
            //   "offset": 36
            // },
            "scale": {
              "type": "linear",
              "range": [5, specConstants.height / 2]
            }
          },
          "color": {
            "field": "binID",
            "type": "quantitative",
            "scale": {
              "domain": data.map((obj: any) => obj["binID"]), // Important, as otherwise the binIDs are sorted as 1,10,11,..., 2,3,4,5,...
              "scheme": colorSchemeCode,
              "type": "threshold"
            },
            "legend": null,
            // "legend": {
            //   "titleFontSize": 22,
            //   "labelFontSize": 18,
            //   "offset": 36
            // }
          }
        }
      },
      {
        "title": null,
        "data": {
          "values": data
        },
        "mark": {
          "type": "rule",
          "tooltip": { "content": "data" }
        },
        "transform": [{
          "filter": "datum.binSize == 0"
        }],
        "encoding": {
          "x": { "field": "binMin", "type": "quantitative", "axis": { "title": null, "values": binBreaks, "format": ".2f" }, "scale": { "domain": [binMin, binMax] } },
          "y": { "field": "binningMethod", "type": "ordinal", "axis": { "title": null, "labelFontSize": 16, "labelLimit": 250, "labelPadding": 10 } },
          "x2": { "field": "binMax", "scale": { "domain": [binMin, binMax] }, "axis": { "format": ".2f" } },
          "size": { "value": 2 },
          "strokeDash": { "value": [8, 8] }
        }
      },
      {
        "title": null,
        "data": {
          "values": dataTicks
        },
        "mark": {
          "type": "tick",
          "tooltip": { "content": "data" },
          "fill": "black",
          "orient": "vertical",
          "thickness": 3,
          "height": specConstants.height / 2
        },
        "encoding": {
          "x": { "field": "data", "type": "quantitative", "scale": { "domain": [binMin, binMax] } }
        }
      }
      ]
    }

    if (binningMethodName == UNCLASSED) {
      delete vlSpec["layer"][0]["encoding"]["color"];
      vlSpec["layer"][0]["mark"]["color"] = {
        "x1": 0,
        "y1": 0,
        "x2": 1,
        "y2": 0,
        "gradient": "linear",
        "stops": [
          { "offset": 0, "color": "#440154" },
          { "offset": 0.1, "color": "#48186a" },
          { "offset": 0.2, "color": "#472d7b" },
          { "offset": 0.3, "color": "#424086" },
          { "offset": 0.4, "color": "#3b528b" },
          { "offset": 0.5, "color": "#33638d" },
          { "offset": 0.6, "color": "#2c728e" },
          { "offset": 0.7, "color": "#26828e" },
          { "offset": 0.8, "color": "#21918c" },
          { "offset": 0.9, "color": "#21a784" },
          { "offset": 1, "color": "#29b872" }
        ]
      }
    }

    return vlSpec;
  }


  /*
  * Create a choropleth map, given the output object and 
  */
  map(binguruRes: any, inputData: number[], geoData: any[], inputDataFeature: string, geoDataFeature: string, geoDataLookup:string = "id", inputDataKey:string = "id", colorSchemeCode = "viridis") {

    let vlSpec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "width": 500,
      "height": 300,
      "data": {
        "values": geoData,
        "format": {
          "type": "topojson",
          "feature": geoDataFeature
        }
      },
      "transform": [{
        "lookup": geoDataLookup,
        "from": {
          "data": {
            "values": inputData
          },
          "key": inputDataKey,
          "fields": [inputDataFeature]
        }
      }],
      "projection": {
        "type": "albersUsa"
      },
      "mark": { type: "geoshape", tooltip: { "content": "data" }, "invalid": null },
      "encoding": {
        "color": {
          "field": inputDataFeature,
          "type": "quantitative",
          "condition": {
            "test": "!isValid(datum['" + inputDataFeature + "'])",
            "value": null
          },
          "scale": {
            domain: binguruRes["binBreaks"],
            type: "threshold",
            scheme: colorSchemeCode
          }
        }
      }
    }

    return vlSpec;
  }
}
