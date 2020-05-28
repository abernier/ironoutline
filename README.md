[![NPM version](https://img.shields.io/npm/v/ironoutline.svg?style=flat)](https://www.npmjs.com/package/ironoutline)

# Ironoutline

Generates an `index.json` file for [`md2oedx`](https://github.com/ironhack/md2oedx) from a CSV [spreadsheet](https://docs.google.com/spreadsheets/d/1XGvru0SkMvTwI7Y76l3UanC0CNvV2CROtoFx2vFVI4g/edit):

```sh
$ npx ironoutline pt "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3uDAa59iofq3f6asa9YJoHxjzmuF0s6SoklVTeRkK7RhrZphPF9RhY1epZAgQNVPW7I8nKFjiH9e-/pub?gid=0&single=true&output=csv"
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
                            
