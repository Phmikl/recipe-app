import { Injectable } from '@angular/core';
import { Recipe } from 'src/models/Recipe';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class RecipesService {

  private recipes: Recipe[] = [];
  constructor() { }

  async loadRecipes(){
    const loadedItems = await Storage.get({ key: 'recipes'});

    if(loadedItems.value !== null){
      const json = JSON.parse((await Storage.get({key: 'recipes'})).value);
      this.recipes = [];
      for(const item of json){
        this.recipes.push(new Recipe(item.title, item.ingredients, item.description));
      }
    }
  }

  async addRecipe(newRecipe: Recipe){
    await this.loadRecipes();
    this.recipes.push(newRecipe);
    await Storage.set({key: 'recipes', value: JSON.stringify(this.recipes)});
  }

  async changeRecipe(id: number, newRecipe: Recipe){
    await this.loadRecipes();
    if(id < this.recipes.length){
      this.recipes[id] = (newRecipe);
    }
    await Storage.set({key: 'recipes', value: JSON.stringify(this.recipes)});
  }

  async deleteRecipe(id: number){
    await this.loadRecipes();
    this.recipes.splice(id,1);
    await Storage.set({key: 'recipes', value: JSON.stringify(this.recipes)});
  }

  setRecipe(newRecipes: Recipe[]){
    this.recipes = newRecipes;
  }

  getRecipes(): Recipe[]{
    return this.recipes.slice();
  }

  getNewIndex(): number{
    this.loadRecipes();
    return this.recipes.length;
  }
}
