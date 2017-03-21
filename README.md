# seng generator
A CLI generator to create code based on templates

## Install

```console
$ npm install -g seng-generator
```

## Usage

The easiest command runs a wizard to create code based on a template.

```console
$ sg wizard
``` 

**Note**: Names can be inputted in any format (slug-case, camelCase, PascalCase etc.). 

## Templates

Seng generator is very flexible, because it's not linked to a language or technology.
Seng generator requires custom user created templates to generate code. 

**creating custom templates**

Creating a template is really easy. The first step is to create a folder that will contain all your templates. Inside the folder you create a folder (don't use spaces) with the name of your template. 
The name of the folder is important because you have to use the name to create code based on that template.

Inside that folder you can add/create your own files. There are no limits it can contain as much files and folder as possible.

You can create as many templates as you need. It's also possible to create multiple template folders. 
You can for example create a template folder per project so it can be shared with other project members together with the rest of the code.

#### Variables

Templates can be customized by using variables. Variables can be used as folder name in the following format ```{variable}```. 
Inside files you can use the handlebar syntax ```{{variable}}```.

**available variables:**

* ```name```: Name in it's original format
* ```name_pc```: Name converted to PascalCase
* ```name_sc```: Name converted to slug-case
* ```name_cc```: Name converted to CamelCase

Don't forget to run ```$ sg init``` or set the template path with ```$ sg settings``` to use your custom templates with seng-generator

## Settings

There are five layers of settings (From least to most important):

* default global settings
* global settings in user directory .senggenerator file
* local settings in .senggenerator file in current directory
* template settings in .senggenerator file in the template directory
* options of the command you are running

An option will always override a local setting etc. 

The five layers combined determine the settings used in every command.

You can see the settings of a directory by running ```$ sg settings```. 
This is without the template specific settings and without the option overrides of course. The same command can be used to modify the settings.

## Commands

#### help

Show help

```console
$ sg -h
```

#### wizard

Starts a wizard to create code based on a template. 

```console
$ sg wizard [type] [name]
```

Arguments:

* ```type```: (Optional) The template you want to use. 
* ```name```: (Optional) The name you want to use in the template.

Examples:
```console
$ sg wizard
$ sg wizard block
$ sg wizard component ScrollBar
```

#### init

Create a local settings file (.senggenerator). Local settings always override global settings.

```console
$ sg init
```

#### generate

Directly create a store module based on the current settings.

```console
$ sg <type> <name>
```

Arguments:

* ```type```: The template you want to use. 
* ```name```: The name you want to use.

Options:

* ```-d, --destination <destination>```: Override the destination for store module.
* ```-p, --template-path <template-path>```: Override template path.
* ```-s, --sub-directory <subdirectory>```: Set subdirectory. This path is added to the destination path. 
* ```-f, --force```: Force creation. By default it's impossible to create code if the destination path doesn't exist. This option forces the creation of code and will generates the destination folders if they don't exist. 

Examples:
```console
$ sg functional-component check-box
$ sg block video -d ./src/components 
$ sg component Button -s ./atoms 
```

#### settings

Set or display settings. Without any options it will show the settings. By default it will set the settings locally in a .senggenerator file.
You can also set global settings by using the global option.

```console
$ sg settings
```

Options:

* ```-d, --destination <destination>```: Set the destination path.
* ```-t, --template-path <template-path>```: Set template path.
* ```-l, --log```: Log global or local settings depending on the global flag.
* ```-g, --global```: Set global settings.

Examples:
```console
$ sg settings -l
$ sg settings -d ./src/app/components -t ./template
$ sg settings -g -d ./components
```

#### reset

Reset global settings to the defaults.

```console
$ sg reset
```
