var secretkey = config.SECRET_KEY;
let mapimg;
let centroid;
let census;

//center of mapbox map
let clat = 51.00;
let clon = -114.0708;

let cx;
let cy;

let zoom = 10.5;

let dwellings = [];

function preload() {
	census = loadJSON("https://data.calgary.ca/resource/qfna-5kbg.json?$select=name,comm_code,sing_famly,duplex,multi_plex,apartment,town_house,manuf_home,conv_struc,comunl_hse");
	centroid = loadJSON("https://data.calgary.ca/resource/kzbm-mn66.json?$select=name,comm_code,location");
	mapimg = loadImage("https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/"+clon+","+clat+","+zoom+",0,0/800x1200?access_token="+ secretkey)

}

function setup() {
	createCanvas(800,1200);
	noLoop();

	imageMode(CENTER);
	translate(width/2, height/2);
	image(mapimg,0,0);

	cx = xtile(clon);
	cy = ytile(clat);

	for (let i=0; i<Object.keys(census).length; i++) {
		let dwelling = [parseInt(census[i].sing_famly), parseInt(census[i].town_house),parseInt(census[i].duplex),parseInt(census[i].apartment),parseInt(census[i].multi_plex)];
		let census_comm = census[i].comm_code;
		// print(dwelling);
		for (let j=0; j<Object.keys(centroid).length; j++) {
			let centroid_comm = centroid[j].comm_code;
			if(census_comm==centroid_comm){
				let lat = centroid[j].location.coordinates[1];
				let lon = centroid[j].location.coordinates[0];

				let x = xtile(lon)-cx;
				let y = ytile(lat)-cy;

				dwellings.push(new Pie(x,y,dwelling,census_comm));

			}
		}
	}
}

function draw() {
	for (let i=0; i<dwellings.length; i++){
		dwellings[i].display();
	}
}

function xtile(lon){
	return ((lon+180)/360)*512*pow(2,zoom);
}

function ytile(lat){
	let sinLatitude = sin(lat *(PI/180));
	return (0.5 - log((1+sinLatitude)/(1-sinLatitude))/(4*PI))*512*pow(2,zoom);
}

class Pie{
	constructor(lon,lat,populations, comm_name){
		this.x = lon+width/2;//readjust for translation
		this.y = lat+height/2;//readjust for translation
		this.pop = populations;
		this.name = comm_name;
		this.total = 0;
		this.angle = 0;
		this.radius = 55;
		this.change = 0;
	}

	display(){
		this.calc_total();

		if(this.total>3000){
	  	for (let i=0; i<this.pop.length; i++){

      	this.change = TWO_PI*(this.pop[i]/this.total);

				fill(226,66,244,230-(65*i));
				noStroke();
      	arc(this.x, this.y, this.radius, this.radius, this.angle, this.angle+this.change);
				fill(255);
				textSize(12);

				text(this.name,this.x,this.y+13,1000)
      	this.angle += this.change;
			}
    }
	}

	calc_total(){
		for (let i=0; i<this.pop.length; i++){
			this.total+=this.pop[i];
		}
	}


}
