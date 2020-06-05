[![NPM version](https://img.shields.io/npm/v/ironoutline.svg?style=flat)](https://www.npmjs.com/package/ironoutline)

Generates an `index.json` file for [`md2oedx`](https://github.com/ironhack/md2oedx) from a CSV [spreadsheet](https://docs.google.com/spreadsheets/d/1XGvru0SkMvTwI7Y76l3UanC0CNvV2CROtoFx2vFVI4g/edit):

```sh
$ npx ironoutline --help
Usage: npx ironoutline [ PTFT ] [ "CSV_URL" | CSV_PATH ] [ --start=START_DATE --hollidays=HOLLIDAYS ]

Generates JSON outline for md2oedx from a CSV.

Example: npx ironoutline pt "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3uDAa59iofq3f6asa9YJoHxjzmuF0s6SoklVTeRkK7RhrZphPF9RhY1epZAgQNVPW7I8nKFjiH9e-/pub?gid=0&single=true&output=csv" --start=2020-06-02 --hollidays=2020-06-20,2020-07-04,2020-07-14,2020-08-11,2020-08-13,2020-08-15,2020-08-18,2020-08-20,2020-08-22,2020-09-19,2020-10-17,2020-11-10,2020-11-21

Options:

  PTFT:       ft or pt (Default: ft)
  
  CSV_URL:    A CSV URL where the outline is configured (Default: https://docs.google.com/spreadsheets/d/e/2PACX-1vR3uDAa59iofq3f6asa9YJoHxjzmuF0s6SoklVTeRkK7RhrZphPF9RhY1epZAgQNVPW7I8nKFjiH9e-/pub?gid=0&single=true&output=csv)
  CSV_PATH:   A CSV file path

  START_DATE: The day in the format YYYY-MM-DD when the course begins

  HOLLIDAYS:  A comma-separated list of days in the format YYYY-MM-DD for days-off
```

# Example

```sh
$ npx ironoutline pt "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3uDAa59iofq3f6asa9YJoHxjzmuF0s6SoklVTeRkK7RhrZphPF9RhY1epZAgQNVPW7I8nKFjiH9e-/pub?gid=0&single=true&output=csv"
```

```sh
$ npx ironoutline pt ~/Downloads/outline-wdpt202006par.csv
```

NB: The json file is directly printed to stdout: to save it to disk, remember to redirect the stdout `> myoutline.json`.

---

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
                                "html": [{"file": "foo.md"}]
                            },
                            {
                                "name": "Bar",
                                "html": [{"file": "bar.md"}]
                            },
                            ...
                    },
                    ...
                ]
            }
        ]
    }
}
                            
