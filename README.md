[![NPM version](https://img.shields.io/npm/v/ironoutline.svg?style=flat)](https://www.npmjs.com/package/ironoutline)

Generates an `index.json` file for [`md2oedx`](https://github.com/ironhack/md2oedx) from a CSV.

# bin

## Usage

See:
```sh
$ npx ironoutline --help
```

## Example

From a CSV [spreadsheet](https://docs.google.com/spreadsheets/d/1EdyLktmJA36Fzeug8NwrTQjUDt4C9wB2eoqs9E6kXK0/edit):

[![](https://res.cloudinary.com/dtqr57xyj/image/upload/v1612991228/Screenshot_2021-02-10_at_22.06.28.png)](https://docs.google.com/spreadsheets/d/1EdyLktmJA36Fzeug8NwrTQjUDt4C9wB2eoqs9E6kXK0/edit)

```sh
$ npx ironoutline csv2json pt "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPb9g-3UgLBIrjBekCEppZ7k733mCQehR9S3OZBxafwQEuXsxkAzC4VkSzOStT6b0Dc851CyLUOc2i/pub?gid=0&single=true&output=csv"
```

From a local file:

```sh
$ npx ironoutline csv2json pt ~/Downloads/outline.csv
```

NB: The json file is directly printed to stdout: to save it to disk, remember to redirect the stdout `> myoutline.json`.

# JS api

```js
const ironoutline = require('ironoutline')

const json = ironoutline.csv2json('pt', 'path/to/outline.csv', {
    tzid: 'Europe/Paris',
    start: '2020-06-02',
    hollidays: ['2020-06-20','2020-07-04','2020-07-14','2020-08-11','2020-08-13','2020-08-15','2020-08-18','2020-08-20','2020-08-22','2020-09-19','2020-10-17','2020-11-10','2020-11-21']
})
console.log(json)
```

## Output

JSON structure is as followed:

```js
{
    "course": {
        "name": "WDPT",
        "number": "MASTER",
        "version": "5.0",
        "chapter": [
            {
                "name": "Week 1",
                "sequential": [
                    {
                        "name": "Day 1",
                        "vertical": [
                            {
                                "name": "Foo",
                                "component": [
                                    {
                                        "type": "html",
                                        "file": "foo.md"
                                    },
                                    {
                                        "type": "deliverable",
                                        "display_name": "Homework",
                                        "deliverable_identifier": "assign1",
                                        "deliverable_description": "Your first homework is to do 100 pushups.",
                                        "deliverable_duedate": "2030-10-28"
                                    }
                                ]
                            },
                            ...
                    },
                    ...
                ]
            }
        ]
    }
}
```

as defined per [`md2oedx` JSON file structure](https://github.com/ironhack/md2oedx#json-file-structure)
