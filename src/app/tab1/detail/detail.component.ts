/* eslint-disable max-len */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ImagesService, LocalFile } from 'src/app/services/images.service';
import { RecipesService } from 'src/app/services/recipes.service';
import { Recipe } from 'src/models/Recipe';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit, OnDestroy {
  id: number;
  recipes: Recipe[] = [];
  recipe: Recipe;
  images: LocalFile[];
  image: LocalFile;

  routesub: Subscription;
  imagesub: Subscription;
  constructor(private route: ActivatedRoute, private router: Router, private recipeService: RecipesService, private imageService: ImagesService) { }

  ngOnInit() {
    this.recipeService.loadRecipes();
    this.recipes = this.recipeService.getRecipes();

    this.imagesub = this.imageService.newLatestImg.subscribe((img) => {
      this.image = img;
    });

    this.routesub = this.route.params.subscribe((params: Params) => {
      this.id = +params.id;
      if(this.id < this.recipes.length){
        this.recipe = this.recipes[this.id];
        this.imageService.loadFile(this.id);
      }
      else{
        this.router.navigate(['/tabs'+'tab1']);
      }
    });
  }

  ionViewWillEnter(){
    this.recipeService.loadRecipes();
    this.recipes = this.recipeService.getRecipes();
    this.recipe = this.recipes[this.id];
    this.imageService.loadFile(this.id);
  }

  navigateTo(){
    this.router.navigate(['/tabs/tab1/'+this.id+'/edit']);
  }

  ngOnDestroy(): void {
    this.routesub.unsubscribe();
    this.imagesub.unsubscribe();
}
}
