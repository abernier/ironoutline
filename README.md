[![NPM version](https://img.shields.io/npm/v/ironoutline.svg?style=flat)](https://www.npmjs.com/package/ironoutline)

# Ironoutline

Generates an `index.json` file for [`md2oedx`](https://github.com/ironhack/md2oedx) from a CSV [spreadsheet](https://docs.google.com/spreadsheets/d/1RiieTGx6PQWkyU52yTXEWN-u5-8njN1zfdXLWm2Nn2c/edit):

```sh
$ npx ironoutline pt https://docs.google.com/spreadsheets/d/e/2PACX-1vTj9crFXFRl9MjP5ibW7210C-cmkdPI1EgzQK1rTYN0SMFpSGe0piWtf40H3S-LDtPVfbYnaDOpvW_N/pub?output=csv
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
                "name": "XXXXX",
                "sequential": [
                    {
                        "name": "Info tabs",
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
                            
