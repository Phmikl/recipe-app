import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from 'src/models/Recipe';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  recipes: Recipe[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

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

  navigateTo(id: number){
    this.router.navigate(['/tabs/tab1/'+id]);
  }
}
