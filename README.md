# Cave Story OST Generator

Electron app to generate custom OST version combinations for Cave Story+.

## Getting Started

[Download the latest release](https://github.com/jozsefsallai/cavestory-ost-generator/releases) from the Releases page, extract the archive, and run `cs_ost_generator.exe`.

## FAQ

### Why?

Because some people prefer different versions of each individual song in the OST, so this tool will help them generate something customized to their own liking. They can also export a configuration and import it for later use.

### Why Electron?

Because I'm a JavaScript junkie. I hate that I made it in Electron too, and I do have plans on rewriting it in a less resource-demanding framework/language.

### Why Sue?

Because I love Sue.

## Contribution

### Requirements

  * Node.js
  * wget and zip/unzip (for fetching the organya)

### Getting Started

**Clone the repo:**

```sh
git clone git@github.com:jozsefsallai/cavestory-ost-generator
cd cavestory-ost-generator
```

**Install the dependencies:**

```sh
npm install
```

**Download the Organya:**

```sh
npm run orgs
```

*Alternatively, you can [download the zip manually](https://s3-us-west-1.amazonaws.com/sallai/cs_organya.zip) and extract the contents to `data/org`.*

**Run with hot reload:**

```sh
npm run start
```

## License

Licensed under the MIT License.

Cave Story/Cave Story+ and Sue Sakamoto belong to Daisuke "Pixel" Amaya and Nicalis, Inc. Organya music by Daisuke "Pixel" Amaya, converted to parseable Ogg Vorbis format by József Sallai (me).
