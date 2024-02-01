import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NgClass, NgForOf} from "@angular/common";
import {PuzzleFactoryService} from "../models/factories/puzzle-factory-service";
import {SolveProgress} from "minizinc";
import {PuzzleComputer} from "../models/puzzle-computer";

@Component({
  selector: 'app-puzzle-computer',
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  templateUrl: '../templates/puzzle-computer.component.html',
  styleUrl: '../css/puzzle-computer.component.css'
})

export class PuzzleComputerComponent {
  public solution: any;
  private puzzle: any;

  constructor() {
    this.puzzle = new PuzzleComputer();
    this.solution = this.puzzle.solveModel();
    console.log("solve : " + this.solution);
  }

  clickedOnce: { [key: string]: boolean } = {};
  clickedTwice: { [key: string]: boolean } = {};
  annule: { [key: string]: boolean } = {};
  propagates: { [key: string]: boolean } = {};
  nb_propagates: { [key: string]: number } = {};
  monitor = ['13\'','15\'', '15.6\'', '21.5\'', '27\''];
  processor =['2.0 MHz', '2.3 MHz', '2.5 MHz', '2.7 MHz', '3.1 MHz'];
  disk = ['250 Gb', '320 Gb', '500 Gb', '750 Gb', '1024 Gb'];
  price =['$ 699,00', '$ 999,00', '$ 1.149,00', '$ 1.349,00', '$ 1.649,00'];


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
    if(this.monitor.includes(name)){
      this.monitor.forEach((m) => {if(m != name) {var1.push(m)}});
    }else if(this.processor.includes(name)) {
      this.processor.forEach((m) => {if(m != name) {var1.push(m)}});
    }else if(this.disk.includes(name)) {
      this.disk.forEach((m) => {if(m != name) {var1.push(m)}});
    }else if(this.price.includes(name)) {
      this.price.forEach((m) => {if(m != name) {var1.push(m)}});
    }

    if(this.monitor.includes(pc)){
      this.monitor.forEach((m) => {if(m != pc) {var2.push(m)}});
    }else if(this.processor.includes(pc)) {
      this.processor.forEach((m) => {if(m != pc) {var2.push(m)}});
    }else if(this.disk.includes(pc)) {
      this.disk.forEach((m) => {if(m != pc) {var2.push(m)}});
    }else if(this.price.includes(pc)) {
      this.price.forEach((m) => {if(m != pc) {var2.push(m)}});
    }

    var1.forEach((v1 : string) : void => {
      if (this.clickedTwice[name+pc]) {
        //this.cellClickedOnce(v1, pc);
        this.cellPropagate(v1,pc)
      } else if(this.annule[name+pc]){
        //if(this.clickedOnce[v1+pc]) {
          this.cellReversePropagate(v1,pc)
          //this.cellAnnule(v1, pc);
        //}
      }
    })
    var2.forEach((v2 : string) : void => {
      if (this.clickedTwice[name+pc]) {
        //this.cellClickedOnce(name, v2);
        this.cellPropagate(name,v2);
      }else if(this.annule[name+pc]) {
          //if(this.clickedOnce[name+v2]) {
            this.cellReversePropagate(name,v2);
            //this.cellAnnule(name, v2);
          //}
      }
    })

  }
  cellClickedOnce(name: string, pc: string) {
    this.clickedOnce[name + pc] = true;
    this.clickedTwice[name + pc] = false;
    if(this.solution["__zone_symbol__state"]) {
      console.log(JSON.stringify(this.solution["__zone_symbol__value"].solution.output.json));
    } else {
      console.log("solving");
    }
    this.annule[name + pc] = false;
  }

  cellClickedTwice(name: string, pc: string) {
    this.clickedOnce[name + pc] = false;
    this.clickedTwice[name + pc] = true;
    this.annule[name + pc] = false;
  }

  cellAnnule(name: string, pc: string) {
    this.clickedOnce[name + pc] = false;
    this.clickedTwice[name + pc] = false;
    this.annule[name + pc] = true;
  }

  cellPropagate(name: string, pc: string) {

    if((this.clickedTwice[name + pc]==false || this.clickedTwice[name + pc]==undefined)  && (this.clickedOnce[name + pc]==false || this.clickedOnce[name + pc]==undefined )) {
      this.propagates[name + pc] = true;
      if(this.nb_propagates[name + pc] == undefined)
        this.nb_propagates[name + pc]=1;
      else this.nb_propagates[name + pc]+=1;
      console.log(this.nb_propagates[name + pc]);
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
}

