// function buldfilterurl(baseurl, filters){
//     let urlparams = []

//     for (let key in filters){
//         if (filters[key]!== "") {
//             urlparams.push(`${key}=${filters[key]}`);
//         }
//     }
//     return `${baseurl}?${urlparams.join("&")}`
// }

// console.log(buldfilterurl("/api/council/",{region:"centre", departement:"Nfoundi",council:"yaoundé1"}))



// _____________________________ ma fonction pour raffrachir les filtre en cas de changement_________________________________________

async function refreshfilters(filter_field, filter_value, content_filter_field) {


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

// ________________________actualisation des filres selon un changement__________________________________

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
    })
    
};

// __________________utilisation du bouton reinitialiser______________________

document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("region_filter").innerHTML = content_region_filter
    document.getElementById("departement_filter").innerHTML = content_departement_filter
    document.getElementById("council_filter").innerHTML = content_council_filter

}) 


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
    maxBounds: [[-90, -180], [90, 180]], //emp�che le d�calage infinit
    maxBoundsViscosity: 1.0, //bloque le glissement hors de cette zone ,
    layers:[googleTerrain],
    zoomControl: false,
})

// Fonction pour obtenir la position de l'utilisateur
map.locate({ setView: true, maxZoom: 16 }); 

// Gérer la réussite de la géolocalisation
map.on('locationfound', function (e) {
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