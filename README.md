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

You can create as many templates as you need. It's also possible to create multiple template folders (a comma 
separated templatePath can be used if there are multiple folders with templates). 
You can for example create a template folder per project so it can be shared with other project members together with the rest of the code.

#### Variables

Templates can be customized by using variables. Variables can be used as folder name in the following format ```{variable}```. 
Inside files you can use the handlebar syntax ```{{variable}}```.

**default available variables:**

* ```name```: Name in it's original format
* ```name_pc```: Name converted to PascalCase
* ```name_sc```: Name converted to slug-case
* ```name_cc```: Name converted to CamelCase
* ```name_snc```: Name converted to snake_case

Don't forget to run ```$ sg init``` or set the template path with ```$ sg settings``` to use your custom templates with seng-generator

#### Custom Variables

Seng-generator also supports custom variables. Custom variables can be used to create more complex templates, because
you can use all the [handlebars features](http://handlebarsjs.com/) like conditional statements and 
loops.

The variables should be declared in the `.senggenerator` file in the root of the specific template folder in an array
called `variables`.

Example `.senggenerator` file with a custom variable: 
```json
{
	"destination": "./src/common/components",
	"variables": [{
		"name": "debug",
		"type": "confirm",
		"message": "Do you want to add debug logs?",
		"isBoolean": true,
		"default": false
	}]
}
```

The options of a variable reflect the [inquirer options](https://github.com/SBoudrias/Inquirer.js#question) 
with a few additions. The options are declared as json so javascript functions can't be used.

Extra options:

* ```isArray```: (boolean) Whether input should be converted to an array. The input should be a comma seperated list 
```value1,value2,value3```.
* ```isNumber```: (boolean) Whether input should be converted to a number.
* ```isBoolean```: (boolean) Whether input should be converted to a boolean.

It's possible to combine the ```isArray``` with ```isNumber``` or ```isBoolean```.

Once they are declared you can use them in your templates: 

```handlebars
{{#if debug}}
	console.log('{{name_pc}}', props);
{{/if}}

{{#if names}}
  <ul>
    {{#each names}}
	      <li>{{this}}</li>
      {{/each}}
   </ul>
{{/if}}

{{functionName}}
```

Once the template is ready for use with seng-generator there are a few ways to set the custom variables:

* `sg wizard`: The questions from the variable config will be added to the default wizard questions. The wizard 
allows spaces.
* `sg <type> <name> -w`: Will show a wizard just for the custom variables defined in the config. The wizard also allows 
spaces.
* `sg <type> <name> -v variable1=true,variable2=showMessage,variable3=[name1,name2,name3]`: This is the fastest way 
to set custom variables. It has one downside and that is that it doesn't allow spaces. So if you need spaces use the 
wizard. If a variable has a default value in the variable config you can also skip it. If you skip a variable that 
doesn't have a default value a warning will be displayed. Always use brackets when declaring an array.

The variable settings per template can be displayed by running `sg settings`.

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

Options:

* ```-f, --force```: Force creation. By default it's impossible override files when they already exist in the 
destination path. This option forces the creation of code and will override files if necessary. 

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
* ```name```: The name you want to use. Can be a comma seperated list to create multiple (example1,example2).

Options:

* ```-d, --destination <destination>```: Override the destination for store module.
* ```-p, --template-path <template-path>```: Override template path.
* ```-s, --sub-directory <subdirectory>```: Set subdirectory. This path is added to the destination path. 
* ```-f, --force```: Force creation. By default it's impossible to create code if the destination path doesn't exist 
or when the files already exists in the destination path. This option forces the creation of code and will generates the destination folders if they don't exist. 
* ```-v, --variables```: Set custom variables the quick way. The custom variables should be declared in the template 
.senggenerator file. Variables should be comma separated and it's impossible to use spaces (use `sg wizard` or `-w` if you 
need spaces). It's also possible to use arrays they should be declared as a comma separated list surrounded by brackets. `-v 
 variable1=true,variable2=[car,house,snow]`
* ```-w, --wizard```: Use wizard to input custom variables.

Examples:
```console
$ sg functional-component check-box
$ sg block video -d ./src/components 
$ sg component Button -s ./atoms 
```

#### settings

Set or display settings. Without any options it will show the settings. By default it will set the settings locally in a .senggenerator file.
You can also set global settings by using the global option. It also displays the custom variable settings so you can
 see which variables can be used in every template.

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
