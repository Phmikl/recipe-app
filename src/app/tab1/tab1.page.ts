import { Component, OnInit } from '@angular/core';
import { Recipe } from 'src/models/Recipe';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  recipes: Recipe[] = [];

  constructor() {}

  ngOnInit(): void {
      this.refreshUserData();
  }

  refreshUserData(){
    if(localStorage.getItem('recipes')){
      const json = JSON.parse(localStorage.getItem('recipes'));
      this.recipes = [];
      for(const item of json){
        this.recipes.push(new Recipe(item.title, item.ingredients, item.description, item.image));
      }
    }
    else{
      this.recipes = [];
    }
  }

  doRefresh(event) {
    this.refreshUserData();
    setTimeout(()=> {
      event.target.complete();
    }, 200);
  }
}
