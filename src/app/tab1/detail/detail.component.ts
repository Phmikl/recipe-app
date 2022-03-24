import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Recipe } from 'src/models/Recipe';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  id: number;
  recipes: Recipe[] = [];
  recipe: Recipe;
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.refreshUserData();
    this.route.params.subscribe((params: Params) => {
      this.id = +params.id;
      if(this.id < this.recipes.length){
        this.recipe = this.recipes[this.id];
      }
      /* else if(this.recipes.length !== 0){
        this.router.navigate(['../0'],  {relativeTo: this.route});
      } */
      else{
        this.router.navigate(['/tabs'+'tab1']);
      }
    });
  }

  navigateTo(){
    this.router.navigate(['/tabs/tab1/'+this.id+'/edit']);
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
}
