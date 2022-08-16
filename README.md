# Open source CHT application for PIH Malawi

This is the open source configuration of the [Community Health Toolkit (CHT)](https://communityhealthtoolkit.org/) application deployed by Partners in Health (PIH) in Malawi for the community health program.

## Setting up

### CHT instance

Use this guide if you need a [development CHT instance](https://docs.communityhealthtoolkit.org/apps/guides/hosting/app-developer/). 

### Clone the repository

Use `git clone` to get a local copy of the repository:

```
git clone https://github.com/medic/cht-pih-malawi-app.git
```

### Install dependencies

Change to the project directory and install npm dependencies using

```
npm install
```

### Upload configuration

Use the [CHT app configurer](https://github.com/medic/cht-conf) to upload the configuration to a CHT instance running [CHT core](https://github.com/medic/cht-core). To set up CHT app configurer, the following steps are required:

#### cht-conf

```
npm install -g cht-conf
```

#### pyxform

`pyxform` is a python package used for creating XForms. Installation is operating system specific as detailed below:

###### Ubuntu

```
sudo python -m pip install git+https://github.com/medic/pyxform.git@medic-conf-1.17#egg=pyxform-medic
```

###### Windows

```
python -m pip install git+https://github.com/medic/pyxform.git@medic-conf-1.17#egg=pyxform-medic --upgrade
```

###### OSX

```
pip install git+https://github.com/medic/pyxform.git@medic-conf-1.17#egg=pyxform-medic
```

#### upload configuration

###### localhost

Use this command if the instance URL is defined in the COUCH_URL environment variable.

```
cht --local
```

###### arbitrary URL

```
cht --url=https://username:password@example.com:12345
```

## Documentation

Supported use-cases:

 - [Maternal and Child Health](https://github.com/medic/cht-pih-malawi-app/wiki/Maternal-and-Neonatal-Health)
 - [Non-communicable diseases](https://github.com/medic/cht-pih-malawi-app/wiki/Non-Communicable-Diseases-(NCD)-workflow)
 - [Family Planning](https://github.com/medic/cht-pih-malawi-app/wiki/Family-Planning)
 - [Integrated Management of Childhood illnesses (IMCi)](https://github.com/medic/cht-pih-malawi-app/wiki/Integrated-Management-of-Childhood-illnesses-(IMCi))
 - [Malnutrition](https://github.com/medic/cht-pih-malawi-app/wiki/Malnutrition)
 - [Human Immunodeficiency Virus (HIV)](https://github.com/medic/cht-pih-malawi-app/wiki/Human-Immunodeficiency-Virus-(HIV))
 - [Tuberculosis](https://github.com/medic/cht-pih-malawi-app/wiki/Tuberculosis-(TB))

## Contributing

Contributions are welcome! Read about how to contribute on the [documentation site](https://docs.communityhealthtoolkit.org/contribute/).

## License

The software is provided under AGPL-3.0. Contributions to this project are accepted under the same license.