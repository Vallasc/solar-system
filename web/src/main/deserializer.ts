class Deserializer {
    /*public static parseJsonFifo(blob: string): Fifo<any> {
      let json = JSON.parse(blob);
      let fifo: Fifo<any> = new Fifo();
      for(let i = 0; i<json.states.length; i++) {
        fifo.push(json.states[i]);
      }
      return fifo;
    }*/

    public static parseJsonFloat64Array(blob: string): Fifo<any> {
      let numParams = 5;
      try{
        let json = JSON.parse(blob);
        console.log(json);
        let fifo: Fifo<any> = new Fifo();
        for(let i = 0; i<json.states.length; i++) {

          let len = json.states[i].p.length+1;
          let objects = new Float64Array(len*numParams);

          objects[0] = len;
          for(let j=0; j<len-1; j++){
            objects[(j+1) * numParams] = json.states[i].p[j].x;
            objects[(j+1) * numParams + 1] = json.states[i].p[j].y;
            objects[(j+1) * numParams + 2] = Deserializer.roundTo1(json.states[i].p[j].r);
            objects[(j+1) * numParams + 3] = json.states[i].p[j].k;
            objects[(j+1) * numParams + 4] = json.states[i].p[j].i;
          }

          fifo.push(objects);
        }
        return fifo;
      } catch (e) {
        throw Error("Failed parsing file");
      }
    }

    public static roundTo1(x: number){
      if( x > 0 && x < 1) return 1;
      else return x;
    }

}