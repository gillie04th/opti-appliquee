import {Component, ViewChild} from '@angular/core';
import {NgClass, NgForOf,NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { CommonModule } from '@angular/common';
import {PuzzleComputer} from "../models/puzzle-computer";
import {PuzzleCreate} from "../models/puzzle-create";
import {waitForAsync} from "@angular/core/testing";
import {ModalSuccessComponent} from "./modal-success.component";

@Component({
  selector: 'app-create-puzzle',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    FormsModule,
    CommonModule,
    ModalSuccessComponent
  ],
  templateUrl: '../templates/create-puzzle.component.html',
  styleUrl: '../css/create-puzzle.component.css'
})

export class CreatePuzzleComponent {
  public solution: any;
  private puzzle: any;
  clickedOnce: { [key: string]: boolean } = {};
  clickedTwice: { [key: string]: boolean } = {};
  annule: { [key: string]: boolean } = {};
  propagates: { [key: string]: boolean } = {};
  nb_propagates: { [key: string]: number } = {};

  peoples: { name: string, object: string[], lieu: string[] , non_object: string[], non_lieu: string[]}[] = [
    { name: '', object: [], lieu: [], non_object: [], non_lieu: [] },
    { name: '', object: [], lieu: [], non_object: [], non_lieu: [] },
    { name: '', object: [], lieu: [], non_object: [], non_lieu: [] }
  ];
  objects: { name: string, personne: string[] , lieu: string[], non_personne:string [], non_lieu: string[]}[] = [
    { name: '', personne: [], lieu: [], non_personne: [], non_lieu: []},
    { name: '', personne: [], lieu: [] ,non_personne: [], non_lieu: []},
    { name: '', personne: [], lieu: [] ,non_personne: [], non_lieu: []}
  ];
  places: { name: string, object: string[], personne: string[] , non_object:string [], non_personne: string[]}[] = [
    { name: '', object: [], personne: [], non_object: [], non_personne: [] },
    { name: '', object: [], personne: [], non_object: [], non_personne: [] },
    { name: '', object: [], personne: [], non_object: [], non_personne: []}
  ];

  objectif: { personne: string, object: string, place: string}[] = [
    { personne: '', object: '', place: ''},
    { personne: '', object: '', place: ''},
    { personne: '', object: '', place: ''}
  ];

  current: { personne: string, object: string, place: string}[] = [
    { personne: '', object: '', place: ''},
    { personne: '', object: '', place: ''},
    { personne: '', object: '', place: ''}
  ];

  showInitForm : boolean = true;
  showContraintes: boolean = false;
  showTable: boolean = false;
  selects: { var1: string, operateur: string ,var2: string,show_obj1 : boolean ,show_obj2 :boolean}[] = [{var1:'',operateur:'',var2:'',show_obj1 : true,show_obj2 :true}];
  @ViewChild(ModalSuccessComponent) modalSuccess: any;
  showModalSuccess = false;
  showModalNotSucess = false;
  listContraintes: string[] = [];
  start: boolean = false;
  unsat: boolean = false;
  /**************************************************************************  Creation puzzle  **************************************************************************/
  onSubmit() {

    this.selects.forEach((value : {var1: string; operateur: string;var2: string; }) : void => {

      const person = this.peoples.find(person => person.name === value.var1);
      if (person) {
        const object = this.objects.find(obj => obj.name === value.var2);
        if (object) {
          if(value.operateur == '+') {
            person.object.push(value.var2);
            object.personne.push(value.var1);
          }else if (value.operateur == "-") {
            person.non_object.push(value.var2);
            object.non_personne.push(value.var1);
          }
        }
        const place = this.places.find(pl => pl.name === value.var2);
        if (place) {
          if(value.operateur == '+') {
            person.lieu.push(value.var2);
            place.personne.push(value.var1);
          }else if (value.operateur == "-") {
            person.non_lieu.push(value.var2);
            place.non_personne.push(value.var1);
          }
        }
      }
      const obj = this.objects.find(o => o.name === value.var1 );
      if (obj) {
        const place = this.places.find(pl => pl.name === value.var2);
        if(value.operateur == '+') {
          obj.lieu.push(value.var2);
          place?.object.push(value.var1);
        }else if (value.operateur == "-") {
          obj.non_lieu.push(value.var2);
          place?.non_object.push(value.var1);
        }
      }
    });
    console.log("contrainte selectione ",this.selects);
    console.log("personne ",this.peoples);
    console.log("lieu ",this.places);
    console.log("objet ", this.objects);

    this.createMinizincPuzzle();
  }

  onSubmitNewPuzzle() {
    this.peoples = [
      {name: '', object: [], lieu: [], non_object: [], non_lieu: []},
      {name: '', object: [], lieu: [], non_object: [], non_lieu: []},
      {name: '', object: [], lieu: [], non_object: [], non_lieu: []}
    ];
    this.objects = [
      {name: '', personne: [], lieu: [], non_personne: [], non_lieu: []},
      {name: '', personne: [], lieu: [], non_personne: [], non_lieu: []},
      {name: '', personne: [], lieu: [], non_personne: [], non_lieu: []}
    ];
    this.places = [
      {name: '', object: [], personne: [], non_object: [], non_personne: []},
      {name: '', object: [], personne: [], non_object: [], non_personne: []},
      {name: '', object: [], personne: [], non_object: [], non_personne: []}
    ];

    this.clickedOnce= {};
    this.clickedTwice={};
    this.annule = {};
    this.propagates = {};
    this.nb_propagates = {};
    this.selects=[{var1:'',operateur:'',var2:'',show_obj1 : true,show_obj2 :true}];
    this.listContraintes =  [];
    this.start = false;
    this.unsat=false;
  }
  onSubmitAdd(type : string){
    this.selects.push({var1:'',operateur:'',var2:'',show_obj1 : true,show_obj2 :true});
  }

  toggleObjetsSelect(index: number) {
    var var1_selected = this.selects[index].var1;
    if (var1_selected != '') {
      if (this.objects.find(obj => obj.name == var1_selected)) {
        this.selects[index].show_obj2 = false;
      } else {
        this.selects[index].show_obj2 = true;
      }
    }

    var var2_selected = this.selects[index].var2;
    if (var2_selected != '') {
      if (this.objects.find(obj => obj.name == var2_selected)) {
        this.selects[index].show_obj1 = false;
      } else {
        this.selects[index].show_obj1 = true;
      }
    }
  }

  createMinizincPuzzle() {
    this.puzzle = new PuzzleCreate();

    this.peoples.forEach((p, index) => {
      var contrainte = "";
      var contrainteAAjouter = false;
      p.lieu.forEach((l, index2) => {
        var indexLieu = this.places.findIndex(pl => pl.name == l);
        if (index2 == 0) {
          contrainteAAjouter = true;
          contrainte += "constraint (lieux_p[" + index + "]==" + indexLieu;
        } else {
          contrainte += " \\/ lieux_p[" + index + "]==" + indexLieu;
        }
      });
      if (contrainteAAjouter) {
        contrainte += ");\n";
        console.log(contrainte);
        this.listContraintes.push(contrainte);
        this.puzzle.addString(contrainte);
      }
      contrainte = "";
      contrainteAAjouter = false;
      p.object.forEach((o, index2) => {
        var indexObjet = this.objects.findIndex(obj => obj.name == o);
        if (index2 == 0) {
          contrainteAAjouter = true;
          contrainte += "constraint (objets_p[" + index + "]==" + indexObjet;
        } else {
          contrainte += " \\/ objets_p[" + index + "]==" + indexObjet;
        }
      });
      if (contrainteAAjouter) {
        contrainte += ");\n";
        console.log(contrainte);
        this.listContraintes.push(contrainte);
        this.puzzle.addString(contrainte);
      }
      contrainte = "";
      contrainteAAjouter = false;
      p.non_lieu.forEach((l, index2) => {
        var indexLieu = this.places.findIndex(pl => pl.name == l);
        if (index2 == 0) {
          contrainteAAjouter = true;
          contrainte += "constraint (lieux_p[" + index + "]!=" + indexLieu;
        } else {
          contrainte += " /\\ lieux_p[" + index + "]!=" + indexLieu;
        }
      });
      if (contrainteAAjouter) {
        contrainte += ");\n";
        console.log(contrainte);
        this.listContraintes.push(contrainte);
        this.puzzle.addString(contrainte);
      }
      contrainte = "";
      contrainteAAjouter = false;
      p.non_object.forEach((o, index2) => {
        var indexObjet = this.objects.findIndex(obj => obj.name == o);
        if (index2 == 0) {
          contrainteAAjouter = true;
          contrainte += "constraint (objets_p[" + index + "]!=" + indexObjet;
        } else {
          contrainte += " /\\ objets_p[" + index + "]!=" + indexObjet;
        }
      });
      if (contrainteAAjouter) {
        contrainte += ");\n";
        console.log(contrainte);
        this.listContraintes.push(contrainte);
        this.puzzle.addString(contrainte);
      }
    });


    this.objects.forEach((obj, index) => {
      var contrainte = "";
      var contrainteAAjouter = false;
      obj.lieu.forEach((l, index2) => {
        var indexLieu = this.places.findIndex(pl => pl.name == l);
        if (index2 == 0) {
          contrainteAAjouter = true;
          contrainte += "constraint (lieux_o[" + index + "]==" + indexLieu;
        } else {
          contrainte += " \\/ lieux_o[" + index + "]==" + indexLieu;
        }
      });
      if (contrainteAAjouter) {
        contrainte += ");\n";
        console.log(contrainte);
        this.listContraintes.push(contrainte);
        this.puzzle.addString(contrainte);
      }
      contrainte = "";
      contrainteAAjouter = false;
      obj.non_lieu.forEach((l, index2) => {
        var indexLieu = this.places.findIndex(pl => pl.name == l);
        if (index2 == 0) {
          contrainteAAjouter = true;
          contrainte += "constraint (lieux_o[" + index + "]!=" + indexLieu;
        } else {
          contrainte += " /\\ lieux_o[" + index + "]!=" + indexLieu;
        }
      });
      if (contrainteAAjouter) {
        contrainte += ");\n";
        console.log(contrainte);
        this.listContraintes.push(contrainte);
        this.puzzle.addString(contrainte);
      }
    });

    this.solution = this.puzzle.solveModel();
    setTimeout(() => {
      console.log(this.solution);

      if (this.solution["__zone_symbol__value"].status == "ALL_SOLUTIONS") {
        var strSol = this.solution["__zone_symbol__value"].solution.output.default.split("\n");
        strSol.forEach((personne: string, index2: number) => {
          var affectation = personne.split(":");
          affectation.forEach((val: any, index: number) => {
            if (val != '') {
              if (index == 0) {
                this.objectif[index2].personne = this.peoples[parseInt(val)].name;
              } else if (index == 1) {
                this.objectif[index2].object = this.objects[parseInt(val)].name;
              } else if (index == 2) {
                this.objectif[index2].place = this.places[parseInt(val)].name;
              }
            }
          })
        })
        this.objectif.forEach((obj,index)=>{
          this.current[index].personne=obj.personne;
        });
        console.log("Solution",this.objectif);
        this.start=true;
      }else if(this.solution["__zone_symbol__value"].status == "UNSATISFIABLE"){
        this.unsat=true;
      }

    }, 5000);

  }


/**************************************************************************  grille du puzzle **************************************************************************/
  cellClicked(name: string, pc: string) {
    if(this.propagates[name + pc] == false || this.propagates[name + pc] == undefined) {
      if (this.clickedOnce[name + pc] == undefined && this.clickedTwice[name + pc] == undefined && this.annule[name + pc] == undefined) {
        this.cellClickedOnce(name, pc);
      } else if (this.clickedOnce[name + pc]) {
        this.cellClickedTwice(name, pc);
        this.propage(name, pc);
      } else if (this.clickedTwice[name + pc]) {
        this.cellAnnule(name, pc);
        this.propage(name, pc);
      } else if (this.annule[name + pc]) {
        this.cellClickedOnce(name, pc);
      }
    }
  }

  propage(name: string, pc: string){
    var var1: string[] = [];
    var var2: string[] =[];
    if (this.peoples.some(person => person.name == name)) {
      this.peoples.forEach((m) => {if(m.name != name) {var1.push(m.name)}});
    }else if (this.objects.some(obj => obj.name == name)) {
      this.objects.forEach((o) => {if(o.name != name) {var1.push(o.name)}});
    }else if (this.places.some(place => place.name == name)) {
      this.places.forEach((pl) => {if(pl.name != name) {var1.push(pl.name)}});
    }

    if (this.peoples.some(person => person.name == pc)) {
      this.peoples.forEach((m) => {if(m.name != pc) {var2.push(m.name)}});
    }else if (this.objects.some(obj => obj.name == pc)) {
      this.objects.forEach((o) => {if(o.name != pc) {var2.push(o.name)}});
    }else if (this.places.some(place => place.name == pc)) {
      this.places.forEach((pl) => {if(pl.name != pc) {var2.push(pl.name)}});
    }

    var1.forEach((v1 : string) : void => {
      if (this.clickedTwice[name+pc]) {
        this.cellPropagate(v1,pc)
      } else if(this.annule[name+pc]){
        this.cellReversePropagate(v1,pc)
      }
    })
    var2.forEach((v2 : string) : void => {
      if (this.clickedTwice[name+pc]) {
        this.cellPropagate(name,v2);
      }else if(this.annule[name+pc]) {
        this.cellReversePropagate(name,v2);
      }
    })

  }
  cellClickedOnce(name: string, pc: string) {
    this.clickedOnce[name + pc] = true;
    this.clickedTwice[name + pc] = false;
    this.annule[name + pc] = false;

  }

  cellClickedTwice(name: string, pc: string) {
    this.clickedOnce[name + pc] = false;
    this.clickedTwice[name + pc] = true;
    this.annule[name + pc] = false;
    this.current.forEach((c)=>{
      if(c.personne == name){
        if(this.objects.some((obj)=> obj.name == pc)){
          c.object = pc;
        }else if(this.places.some((pl)=> pl.name == pc)){
          c.place = pc;
        }
      }
    });
    console.log("Solution courrente",this.current);
    if(this.isComplet()){
      var puzzleTest = new PuzzleCreate();
      puzzleTest.setPuzzleContent(this.puzzle.getPuzzleContent());
      this.listContraintes.forEach((c)=> puzzleTest.addString(c));
      this.current.forEach((c,index)=>{
        var constraint= "constraint objets_p["+index+"]=="+this.objects.findIndex(o => o.name == c.object)+";\n";
        constraint += "constraint lieux_p["+index+"]=="+this.places.findIndex(p => p.name == c.place)+";\n";
        puzzleTest.addString(constraint)
      });
      var solutionTest : any = puzzleTest.solveModel();
      setTimeout(() => {
        //if(JSON.stringify(this.current) === JSON.stringify(this.objectif)){
        console.log("res",solutionTest);
        if(solutionTest["__zone_symbol__value"].status == "ALL_SOLUTIONS"){
          this.showModalSuccess = true;
        }else if(solutionTest["__zone_symbol__value"].status == "UNSATISFIABLE"){
          this.showModalNotSucess = true;
        }
      }, 5000);
    }
  }

  isComplet(): boolean {
    let complet = true;
    for (let element of this.current) {
      if (element.personne === '' || element.object === '' || element.place === '') {
        complet = false;
        break;
      }
    }
    return complet;
  }
  cellAnnule(name: string, pc: string) {
    this.clickedOnce[name + pc] = false;
    this.clickedTwice[name + pc] = false;
    this.annule[name + pc] = true;
    this.current.forEach((c)=>{
      if(c.personne == name){
        if(this.objects.some((obj)=> obj.name == pc)){
          c.object = '';
        }else if(this.places.some((pl)=> pl.name == pc)){
          c.place = '';
        }
      }
    });
  }

  cellPropagate(name: string, pc: string) {

    if((this.clickedTwice[name + pc]==false || this.clickedTwice[name + pc]==undefined)  && (this.clickedOnce[name + pc]==false || this.clickedOnce[name + pc]==undefined )) {
      this.propagates[name + pc] = true;
      if(this.nb_propagates[name + pc] == undefined)
        this.nb_propagates[name + pc]=1;
      else this.nb_propagates[name + pc]+=1;
    }
  }

  cellReversePropagate(name: string, pc: string) {
    if((this.clickedTwice[name + pc]==false || this.clickedTwice[name + pc]==undefined)  && (this.clickedOnce[name + pc]==false || this.clickedOnce[name + pc]==undefined )) {
      if (this.nb_propagates[name + pc] == 1) {
        this.propagates[name + pc] = false;
        this.nb_propagates[name + pc] -=1;
      } else if (this.nb_propagates[name + pc] > 1) {
        this.nb_propagates[name + pc] -=1;
      }
    }
  }
  /*
  checkAnswer(){
    if(this.solution["__zone_symbol__state"]) {
      var strSol = this.solution["__zone_symbol__value"].solution.output.default.split("\n");
      var line="";
      strSol.forEach((personne:string) => {
        var affectation = personne.split(":");
        affectation.forEach((val:any, index:number) => {
          if(val != '') {
            if (index == 0) {
              line += this.peoples[parseInt(val)].name;
            } else if (index == 1) {
              line += ":" + this.objects[parseInt(val)].name;
            } else if (index == 2) {
              line += ":" + this.places[parseInt(val)].name + "\n";
            }
          }
        })
      })
      console.log(line);
    } else {
      console.log("solving ...");
    }
    */


  protected readonly Object = Object;
}

