import os

# Spécifie le répertoire dans lequel tu veux renommer les fichiers
repertoire = os.path.abspath('Map/static/Map/data/fiche_signalitique')

# Parcours tous les fichiers du répertoire
for nom_fichier in os.listdir(repertoire):
    # Vérifie si le fichier contient un espace
    if ' ' in nom_fichier:
        # Crée le nouveau nom en remplaçant les espaces par des underscores
        nouveau_nom = nom_fichier.replace(' ', '_')
        # Crée le chemin complet des fichiers
        ancien_chemin = os.path.join(repertoire, nom_fichier)
        nouveau_chemin = os.path.join(repertoire, nouveau_nom)
        # Renomme le fichier
        os.rename(ancien_chemin, nouveau_chemin)
        print(f"Le fichier {nom_fichier} a été renommé en {nouveau_nom}")