# TWS - Projet 1

Ceci est le code du projet 1 de TWS. Il a pour but de créer un guide du tourisme pour diverses randonnées à l'aide de .gpx, d'OSM et de DBpedia.

## Ressources

* BDD : GraphDB & DBpedia
* Serveur et Client : Nodejs

## Installation

Il y a besoin de Git et Nodejs (dont npm).

### 1 - Cloner le project

```bash
git clone https://github.com/laetitiadoerks/twsProject1
```

### 2 - Installer les dépendances

```bash
npm install
cd twsProject1_guide
npm install
```

### 3 - Créer la BDD

```bash
cd ..
npm start
```

8 fichiers  ttl sont créés. Il faut ensuite aller les ajouter à GraphDB, dans un repository nommé tws_laetitia_valentin.
Nous avons donc une BDD de tacks auxquelles sont parfois accroché des points d'intérêts venant d'OSM.

### 4 - Créer et afficher le guide touristique

```bash
cd twsProject1_guide
npm start
```

Et le tour est joué ! il suffit maintenant d'ouvrir un navigateur sur la page localhost:4000 afin de voir le guide !
Celui-ci est complété par des informations récupérées sur DPpedia. Ainsi, chaque track se voit ajouter de nouveaux points d'intérêts proches.

**ATTENTION :** Parfois il faut arrêter le serveur lancé par l'étape 4 et le relancer car celui-ci crash après un certains temps, pas à chaque fois.