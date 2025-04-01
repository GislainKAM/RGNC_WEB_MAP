// _____________________________ ma fonction pour raffrachir les filtre en cas de changement_________________________________________

async function refreshfilters(filter_field, filter_value, content_filter_field) {

    content_filter_field = document.getElementById(`${filter_field}_filter`).innerHTML
    let filters = {
        region: [], 
        departement: [], 
        council:[]
    }

    async function callapicouncil(){ 
        
        let url

        if  (filter_field=="council") {
            url = `/api/council/?name=${filter_value}`
        } else {
            url = `/api/council/?${filter_field}=${filter_value}`
        }
         const fectcher = await fetch(url)
         const json = await fectcher.json()
         return json.features
    }

    let Data = await callapicouncil();

    function getfieldvalues() {
        let region_value = []
        let departement_value = []
        let council_value = []

        for (const feature of Data) {
            region_value.push(feature.properties.region);
            departement_value.push(feature.properties.departement);
            council_value.push(feature.id)
        }

        // mise à jour des filtres globaux
        filters.region = [...new Set(region_value)]; // Suppression des doublons
        filters.departement = [...new Set(departement_value)];
        filters.council = [...new Set(council_value)];

    }
    getfieldvalues();
    
    function changecontentvaluefilters() {
        region_filter.innerHTML = "";
        departement_filter.innerHTML = "";
        council_filter.innerHTML = "";
        
        // Créer un élément option vide par défaut
        let defaultOption = document.createElement("option");
        defaultOption.textContent = "Sélectionner";
        defaultOption.value = ""
        defaultOption.setAttribute("disabled", "true")
        defaultOption.setAttribute("selected", "true")
        region_filter.appendChild(defaultOption);
        departement_filter.appendChild(defaultOption.cloneNode(true));  // Cloner pour le deuxième filtre
        council_filter.appendChild(defaultOption.cloneNode(true)); // Cloner pour le troisième filtre

        for (const region of filters.region) {
            let value_HTML = document.createElement("option")
            value_HTML.setAttribute("value", region)
            value_HTML.textContent= region
            region_filter.appendChild(value_HTML)
            
        }
        for (const departement of filters.departement) {
            let value_HTML = document.createElement("option")
            value_HTML.setAttribute("value", departement)
            value_HTML.textContent = departement
            departement_filter.appendChild(value_HTML)
        }
        for (const council of filters.council) {
            let value_HTML = document.createElement("option")
            value_HTML.setAttribute("value", council)
            value_HTML.textContent = council
            council_filter.appendChild(value_HTML)
        }
        for (const key in filters){
            if (filters[key].length == 1) {
                document.getElementById(`${key}_filter`).value = filters[key][0]
            }
        }


    document.getElementById(`${filter_field}_filter`).innerHTML = content_filter_field;
    document.getElementById(`${filter_field}_filter`).value = filter_value
    }

    changecontentvaluefilters()

 }

// _______________________initialisation de la carte leaflet__________________________________

//declaration des variable de map
const openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 2, 
    noWrap: true,
    attribution:  '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
})

const googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&',{
    maxZoom: 20,
    noWrap: true,
    minZoom: 2, 
    subdomains:['mt0','mt1','mt2','mt3']
});

const googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    noWrap: true,
    minZoom: 2, 
    subdomains:['mt0','mt1','mt2','mt3']
}); 

const baselayers = {
    'OpenStreetMapFr': openstreetmap,
    'Google map': googleTerrain,
    'google hybride': googleHybrid, 
}

//initialisation de la carte
var map = L.map('map', {
    zoom: 13,
    minZoom: 6,
    maxBounds: [[-90, -180], [90, 180]], //emp�che le d�calage infinit
    maxBoundsViscosity: 1.0, //bloque le glissement hors de cette zone ,
    layers:[googleTerrain],
    zoomControl: false,
})

// Fonction pour obtenir la position de l'utilisateur
map.locate({ setView: true, maxZoom: 13 }); 

// Gérer la réussite de la géolocalisation
const add_user_location = map.on('locationfound', function (e) {
    var userMarker = L.marker(e.latlng).addTo(map)
        .bindPopup("Vous êtes ici").openPopup();
    var locationcircle = L.circle(e.latlng).addTo(map);
});

map.on('locationerror', function (e){
    alert("veillez activer la localisation")
})

// controleur de zoom

const zoomControl= L.control.zoom({
        position:'topright',
    }
).addTo(map)

// ajout des baselayers à la carte
const layercontrol = L.control.layers(baselayers).addTo(map)

// ajout de l'echelle
const scalecontrol = L.control.scale({
    position: 'bottomleft'
}).addTo(map)

// centrer l'echelle en bas de la carte
let scale_parent = document.querySelector('.leaflet-control-scale').parentNode
scale_parent.classList.add("leaflet-bottom-center")


// ajout des données par defaut à la carte
let council_layer
let borne_layer
let style_council = {style : {
    fill: false,
    color: "#414F4D",
    weight: 5,
}}
let layers = L.layerGroup().addTo(map);


function getCustomIcon(RESEAU) {
    return L.icon({
        iconUrl: RESEAU==="BASE"
        ? urlBorneBase
        : urlBorneRef,
        iconSize: [49.5/2.5, 39.3/2.5],
        iconAnchor: [24.75/2.5, 39.3/2.5],
        popupAnchor: [0, -39.3/2.5]
    })
}

// Fonction pour ajouter une légende à la carte
function addLegend(map) {
    var legend = L.control({ position: "bottomright" }); // Position de la légende

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "leaflet-legend"); // Crée une div avec la classe CSS

        // Contenu de la légende
        div.innerHTML = `
            <h4>Légende</h4>
            <div><img src="${urlBorneRef}" alt=""><small>Borne de Réference</small></div>
            <div><img src="${urlBorneBase}" alt=""><small>Borne de Base</small></div>
            <div><img src="${urlbordercouncil}" alt=""><small>Commune</small></div>
        `;
        return div;
    };

    legend.addTo(map); 
}

addLegend(map);

// ensembles des parametre qui permettent de définir la symbologie des couches et leurs pop
const setIconBorne =  {
    pointToLayer: function(feature, latlng){
        return L.marker(latlng, {
            icon: getCustomIcon(feature.properties.reseau)
        });
    }
    , onEachFeature: function(feature, layer){
        return layer.bindPopup(
            `
            <div class="leaflet-pop">
                <h3>${feature.id}</h3>
                <div class="infos-point">
                    <div><span>Nom: </span> ${feature.properties.name}</div>
                    <div><span>Commune: </span>${feature.properties.council}</div>
                    <div><span>Lieu dit: </span>${feature.properties.place_name}</div>
                </div>
                <button id = "${feature.id}">ajouter à la liste</button>
            </div>
            
            `
        , 
        {
            maxWidth: 150,
            minWidth: 100,
            minHeight: 150,
        }
    );
}}

let json_borne= ""

get_df_data = async function () {
    const fectcher_council = await fetch("/api/council")
    const json_council = await fectcher_council.json()
    council_layer = L.geoJSON(json_council.features, style_council)
    const fectcher_borne = await fetch("/api/borne")
    json_borne = await fectcher_borne.json()
    borne_layer = L.geoJSON(json_borne.features, setIconBorne)
}

add_df_data_tomap = async function () {
    await get_df_data()
    borne_layer.addTo(layers)
    map.fitBounds(council_layer.addTo(layers).getBounds()) 
}

function removeAllLayers() {
    layers.clearLayers();
}

add_df_data_tomap()

//  ________________________________fonction d'annution d'evenement si un autre est declencher___________________________________

let debounceTimeout = null;

function debounceRefreshFilters(callback, delay = 500) {
    clearTimeout(debounceTimeout); // Annule le dernier appel s’il existe
    debounceTimeout = setTimeout(callback, delay); // Attend un délai avant d'exécuter
}

// ________________________actualisation des filres et la carte selon un changement__________________________________

const filters = ["region", "departement","council"]
const region_filter = document.getElementById("region_filter");
const departement_filter = document.getElementById("departement_filter");
const council_filter = document.getElementById("council_filter");

const content_region_filter = document.getElementById("region_filter").innerHTML;
const content_departement_filter = document.getElementById("departement_filter").innerHTML;
const content_council_filter = document.getElementById("council_filter").innerHTML;

const content = {region_filter: content_region_filter, departement_filter: content_departement_filter, council_filter: content_council_filter}

for (const filter of filters) {
    const filter_field = `${filter}_filter`;
	document.getElementById(filter_field).addEventListener("change", () => {
        const filter_value = document.getElementById(`${filter_field}`).value;
        let content_filter_field = ""
        for (const key in content) {
            if (key == filter_field) {
                content_filter_field = content[key]
            } 
        }
    	refreshfilters(filter, filter_value, content_filter_field)
        layers.clearLayers()

        function refreshMap() {
            function buldfilterurl(baseurl, filters){
                let urlparams = []
            
                for (let key in filters){
                    if (filters[key]!== "") {
                        urlparams.push(`${key}=${filters[key]}`);
                    }
                }
                return `${baseurl}?${urlparams.join("&")}`
            }
            
            const filters1 = {
                council__region: region_filter.value,
                council__departement: departement_filter.value,
                council: council_filter.value
            }
            const filters2 = {
                region: region_filter.value,
                departement: departement_filter.value,
                name: council_filter.value
            }
            
            
            const baseurl1 = "/api/borne/"
            const baseurl2 = "/api/council/"
            const url = buldfilterurl(baseurl1, filters1)
            const url2 = buldfilterurl(baseurl2, filters2)
            let Data = ''
            async function getdata(url) {
                const response = await fetch(url)
                const json= await response.json()
                Data = await json.features
                
            }
            async function addDataToMap() {
                await getdata(url)
                L.geoJSON(Data, setIconBorne).addTo(layers)
                await getdata(url2)
                const council = await L.geoJSON(Data, style_council).addTo(layers)  // ajout de la couche arrondissement correspondant et zoom dessus
                map.fitBounds(council.getBounds())
            }
            addDataToMap()
        }
        refreshMap()
})
    
};

// __________________utilisation du bouton reinitialiser______________________

document.getElementById("reset").addEventListener("click",async () => {
    // 1 Désactiver temporairement les filtres
    region_filter.disabled = true;
    departement_filter.disabled = true;
    council_filter.disabled = true;

    document.getElementById("region_filter").innerHTML = content_region_filter
    document.getElementById("departement_filter").innerHTML = content_departement_filter
    document.getElementById("council_filter").innerHTML = content_council_filter
    layers.clearLayers()
    add_user_location
    await add_df_data_tomap()

    // 5 Réactiver les filtres une fois la réinitialisation terminée
    region_filter.disabled = false;
    departement_filter.disabled = false;
    council_filter.disabled = false;
})


document.addEventListener("DOMContentLoaded", async function () {
    // Désactiver les filtres au début
    region_filter.disabled = true;
    departement_filter.disabled = true;
    council_filter.disabled = true;

    // Attendre que tous les filtres soient mis à jour
    await refreshfilters("region", "", "");

    // Réactiver les filtres une fois que la page est prête
    region_filter.disabled = false;
    departement_filter.disabled = false;
    council_filter.disabled = false;
});




// gestion des fiches signalitique(ajour des diches, suppression )



// // ajouter un evement sur chaque boutons du poppup des bornes
// addFiche = async function () {
//     // recuperation des id des bornes
//     let id_bornes = []
//     get_id_bornes = async function () {
//         await get_df_data()
//         json_borne.features.forEach(element => {
//         id_bornes.push(element.id)
//        });
//     }
//     await get_id_bornes()

//     id_bornes.forEach(id_borne => {
//        const  button = document.getElementById(`${id_borne}`)

//        button.addEventListener("click", () => {
//         const list_content = document.querySelector("#list_content")

//         // créer un nouvel élément de liste
//         const list_item = document.createElement("div")
//         list_item.classList.add("list_items")
//         list_item.id=`${id_borne}`

//         list_item.innerHTML = `
//             <span class="name">${id_borne}</span>
//             <span class="dots"></span>
//             <button class="remove-btn">&times;</button>
//         `
//         listItem.querySelector(".remove-btn").addEventListener("click", function() {
//             listContainer.removeChild(list_item);
//         });
//         list_content.appendChild(list_item)

//        })
//     })


// };

map.on("popupopen", function(e){
    
    let popup_content = e.popup.getElement(); // récupère l'élement du popup
    let button = popup_content.getElementsByTagName("button")[0];
    
    if (button) {
    button.addEventListener("click", () => {
        const list_content = document.querySelector("#fiche_content");

        // créer un nouvel élément de liste
        const list_item = document.createElement("div");
        list_item.classList.add("fiche_items");
        list_item.id= button.id.replace(/\s+/g, "_");

        list_item.innerHTML = `
            <span class="name">${button.id}</span>
            <span class="dots"></span>
            <button class="remove-btn"><img src = "${urldeleteicon}" class="delete_icon"></button>
        `;
        list_item.querySelector(".remove-btn").addEventListener("click", function() {
            list_content.removeChild(list_item);
        });
        if (list_content.contains(list_content.querySelector(`#${list_item.id}`))) {
            list_content.removeChild(list_content.querySelector(`#${list_item.id}`))
            list_content.appendChild(list_item)
        }
        else{
            list_content.appendChild(list_item)
        }


    });
    }
})