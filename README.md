# BinGuru

BinGuru is a Javascript package with an API to several established data binning / data classification methods, often used for visualizing data on choropleth maps. It also includes an implementation of a new, consensus binning method, 'Resiliency'.


### Install
- `npm install binguru`


### Usage

```ts
import { BinGuru } from "binguru";

let rawData = [1, 45, 65, 23, 65, 87, 54, 45, 31, 21, 12, 12, 98, 56, 76, null, null, "nan", undefined, "", "null"]; // Input array of numbers, strings, nulls, nans, undefineds.
let binCount = 5; // Desired number of bins (inconsequential for certain binning methods, e.g., boxPlot).
let binExtent = 10; // Desired bin interval (only applicable for certain binning methods, e.g., definedInterval).
let precision = 2; // Desired rounding off precision.
let binGuruObj = new BinGuru(rawData=rawData, binCount=binCount, binExtent=binExtent, precision=precision); // Initialize an instance of BinGuru

let bins = binGuruObj.fisherJenks(); // Call an endpoint, e.g., fisherJenks() to bin using the FisherJenks / Natural Breaks binning method first.
console.log(bins);
```

### API and Demo
Check out this <a target="_blank" href="https://observablehq.com/@arpitnarechania/binguru-demo">Observable Notebook</a>.


### Build and Publish
- Install dependencies: `npm install`
- Build the package: `npm run build`
- Set version: `npm version prerelease --preid=<version>`
- Dry run: `npm publish --dry-run`
- Publish to the registry: `npm publish`


### Credits
BinGuru was created by
<a target="_blank" href="http://narechania.com">Arpit Narechania</a>, <a href="https://va.gatech.edu/endert/">Alex Endert</a>, and <a href="https://friendlycities.gatech.edu/">Clio Andris</a> of the <a target="_blank" href="https://vis.gatech.edu/">Georgia Tech Visualization Lab.</a> We thank the members of the <a target="_blank" href="http://vis.gatech.edu/">Georgia Tech Visualization Lab</a> for their support and constructive feedback.</p>


### Citations
```bibTeX
@InProceedings{narechania2023resiliency,
  author =	{Narechania, Arpit and Endert, Alex and Andris, Clio},
  title =	{{Resiliency: A Consensus Data Binning Method}},
  booktitle =	{12th International Conference on Geographic Information Science (GIScience 2023)},
  pages =	{55:1--55:7},
  series =	{Leibniz International Proceedings in Informatics (LIPIcs)},
  year =	{2023},
  volume =	{277},
  publisher =	{Schloss Dagstuhl -- Leibniz-Zentrum f{\"u}r Informatik},
  doi =		{10.4230/LIPIcs.GIScience.2023.55}
}
```

### License
The software is available under the [MIT License](https://github.com/arpitnarechania/binguru/blob/master/LICENSE).


### Contact
If you have any questions, feel free to [open an issue](https://github.com/arpitnarechania/binguru/issues/new/choose) or contact [Arpit Narechania](http://narechania.com).
