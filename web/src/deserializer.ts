class Deserializer {

    public getJson(filename: string) : void{ 
        let xhttp = new XMLHttpRequest();
        xhttp.open("GET", filename, true);
        xhttp.onload = function() {
          if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(xhttp.responseText);

            let particles : Array<Body> = []; 
            let json : Array<Array<Body>> = []; 
            let i : number;
            let j : number;
            for(i = 0; i<data['states'].length; i++) {
                for(j = 0; j<data['states'][i]['particles'].length; j++) {
                    let b = new Body();
                    b.x = data['states'][i]['particles'][j]['positionX'];
                    b.y = data['states'][i]['particles'][j]['positionY'];
                    b.vX = data['states'][i]['particles'][j]['velocityX'];
                    b.vY = data['states'][i]['particles'][j]['velocityY'];
                    b.accX = data['states'][i]['particles'][j]['accX'];
                    b.accY = data['states'][i]['particles'][j]['accY'];
                    b.radius = data['states'][i]['particles'][j]['radius'];
                    b.mass = data['states'][i]['particles'][j]['mass'];
                    b.k_energy = data['states'][i]['particles'][j]['k_energy'];
                    b.internal_energy = data['states'][i]['particles'][j]['internal_energy'];
                    particles.push(b);
                }
                json.push(particles);
                particles = [];
            }
           
            console.log(json);
          }
        };
        xhttp.send();
    }

    public static parseJson(blob: string): Array<Array<Body>> {
      let json = JSON.parse(blob);

      let particles : Array<Body> = []; 
      let parsed : Array<Array<Body>> = []; 
      for(let i = 0; i<json['states'].length; i++) {
          for(let j = 0; j<json['states'][i]['particles'].length; j++) {
              let b = new Body();
              b.x = json['states'][i]['particles'][j]['positionX'];
              b.y = json['states'][i]['particles'][j]['positionY'];
              b.vX = json['states'][i]['particles'][j]['velocityX'];
              b.vY = json['states'][i]['particles'][j]['velocityY'];
              b.accX = json['states'][i]['particles'][j]['accX'];
              b.accY = json['states'][i]['particles'][j]['accY'];
              b.radius = json['states'][i]['particles'][j]['radius'];
              b.mass = json['states'][i]['particles'][j]['mass'];
              b.k_energy = json['states'][i]['particles'][j]['k_energy'];
              b.internal_energy = json['states'][i]['particles'][j]['internal_energy'];
              particles.push(b);
          }
          parsed.push(particles);
          particles = [];
      }
      return parsed;
    }
}