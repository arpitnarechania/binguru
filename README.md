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

### API
Coming soon.


### Demos
Coming soon.


### Build and Publish
- Install dependencies: `npm install`
- Build the package: `npm run build`
- Publish to the registry: `npm publish`


### Test
Coming soon.


### Credits
BinGuru was created by
<a target="_blank" href="http://narechania.com">Arpit Narechania</a>, <a href="https://va.gatech.edu/endert/">Alex Endert</a>, and <a href="https://friendlycities.gatech.edu/">Clio Andris</a> of the <a target="_blank" href="http://vis.gatech.edu/">Georgia Tech Visualization Lab.</a>

We thank the members of the <a target="_blank" href="http://vis.gatech.edu/">Georgia Tech Visualization Lab</a> for their support and constructive feedback.</p>


### Citations
```bibTeX
@article{narechania2023resiliency,
  title = {{Resiliency: A Consensus Binning Method}},
  author = {{Narechania}, Arpit and {Endert}, Alex and {Andris}, Clio},
  journal={GIScience 2023 Short Paper Proceedings},
  doi = {},
  year = {2023}
}
```

### License
The software is available under the [MIT License](https://github.com/arpitnarechania/binguru/blob/master/LICENSE).


### Contact
If you have any questions, feel free to [open an issue](https://github.com/arpitnarechania/binguru/issues/new/choose) or contact [Arpit Narechania](http://narechania.com).