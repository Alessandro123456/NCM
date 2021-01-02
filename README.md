# Burp-Recheck-Extension
A Burp Extension module to perform rechecks.
## Prerequisites
* **Visual Code** (This Guide is for Visual Code Editor).
    * Java Extension Pack.
* **OpenJDK**
* **Gradle**
* **Docker-Compose**
* **Burp Professional edition**

## Description
[Fai sapere alle persone cosa può fare nello specifico il tuo progetto. Fornisci il contesto e aggiungi un collegamento a qualsiasi riferimento con cui i visitatori potrebbero non avere familiarità. È inoltre possibile aggiungere qui un elenco di funzionalità ]

## Badges
[aggiungere immagini tramite Shields : http://shields.io/]
## Visuals
[A seconda di ciò che stai realizzando, può essere una buona idea includere screenshot]
## Installation
This guide is for Visual Code Editor. 
* **Generate JAR FILE**
    * Press F1
        * Select Configure Default Build Task
        * Create tasks.json file from template
        * Select Others
    * In .vscode\tasks.json past
```bash
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "2.0.0",
    "tasks": [
        {
            "label": "gradle",
            "type": "shell",
            "command": "gradle bigjar",
            // "command": "gradlew.bat bigjar", // Wrapper on Windows
            // "command": "gradlew bigjar",     // Wrapper on *nix
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

    * Press Ctrl+Shift+B for generate .jar
* **Setting Up IntelliCode**
    * Press F1
        * Select Java Clean the Java language server workspace.
        * Press restart and delete popup

* **Debugging the Extension with VS Code**
    * Start Burp with this command:
    ```bash
        java -agentlib:jdwp=transport=dt_socket,address=localhost:8000,server=y,suspend=n jar "Directory_burp_suite_jar\burpsuite_community.jar"
    ```
    * Create in .vscode/launch.json
    * Past this section:
    ```bash
    {
    "version": "0.2.0",
    "configurations": [
        {
            "type": "java",
            "name": "BurpExtension",
            "request": "attach",
            "hostName": "localhost",
            "port": 8000 // Change this if you had set a different debug port.
        }
    ]
    }
    ```
    * Put a breakpoint
    * Press F5
## Usage
 [Usa gli esempi liberamente e mostra l'output atteso se puoi. È utile avere in linea il più piccolo esempio di utilizzo che puoi dimostrare, fornendo al contempo collegamenti ad esempi più sofisticati se sono troppo lunghi per essere ragionevolmente inclusi nel README.]
 * **Start docker enviroment**
    * Go in docker_compose_test
    * Configure .env file
        * Select port of Juice Shop and Bodgeit
    * Set up containers
    ```bash
        docker-compose up
    ```
    * Do Penetration Testing or using .burp in docker_compose_test ( see later )
* **Set-up Burp**
    * Open Burp and select .burp in docker_compose_test
    ![my screenshot](./figure_readme/1.png)
    * Select Use options saved with project
    * Start Burp
    * Go in Extender 
    ![my screenshot](./figure_readme/2.png)
    * Click Add
    * Select Extentions Type : Java
    * Select file in this directory:
    ```bash
        build/libs/Burp-Recheck-Extension-all.jar
    ```
    * For reload click this check-box with CTRL+right mouse
    ![my screenshot](./figure_readme/3.png)

## Support
[Spiega alle persone dove possono rivolgersi per chiedere aiuto.]
## Roadmap
[Se hai idee per le versioni future, è una buona idea elencarle nel README.]
## Contributing
[Per le persone che desiderano apportare modifiche al proprio progetto, è utile disporre di documentazione su come iniziare.]
## Authors and acknowledgment

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Project status