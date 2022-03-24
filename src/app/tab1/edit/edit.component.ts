/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { AlertController, LoadingController } from '@ionic/angular';
import { Ingredient } from 'src/models/Ingredient';
import { Recipe } from 'src/models/Recipe';

const IMAGE_DIR = 'stored-images';
export interface LocalFile {
  name: string;
  path: string;
  data: string;
}
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {

  id: number;
  recipes: Recipe[] = [];
  recipe: Recipe;

  images: LocalFile[] = [];
  latestImg: LocalFile;
  letztesPhoto: string;
  recipeForm: FormGroup;
  constructor(private route: ActivatedRoute, private router: Router, private loadinCtrl: LoadingController, private alertController: AlertController) { }

  get controls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

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

    this.recipeForm = new FormGroup({
      title: new FormControl(this.recipe.title, Validators.required),
      ingredients: new FormArray([]),
      description: new FormControl(this.recipe.description, Validators.required)
    });
    for(const item of this.recipe.ingredients){
      (this.recipeForm.get('ingredients') as FormArray).push(
        new FormGroup({
          name: new FormControl(item.name, Validators.required),
          amount: new FormControl(item.amount, [Validators.required, Validators.min(1)])
        })
      );
    }

    this.letztesPhoto = this.recipe.image.data;
    //this.loadFiles();
  }

  onSubmit(){
    const ingredients: Ingredient[] = [];
    for(const item of this.recipeForm.value.ingredients){
      ingredients.push(new Ingredient(item.name, item.amount));
    }

    this.recipes[this.id] = new Recipe(this.recipeForm.value.title, ingredients, this.recipeForm.value.description, this.recipes[this.id].image);
    localStorage.setItem('recipes', JSON.stringify(this.recipes));
  }

  addIngredient(){
    (this.recipeForm.get('ingredients') as FormArray).push(
      new FormGroup({
        name: new FormControl(null, Validators.required),
        amount: new FormControl(null, [Validators.required, Validators.min(1)])
      })
    );
  }
  deleteIngredient(index: number){
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  deleteRecipe(){
    this.presentAlertConfirm();
    /* this.recipes.splice(this.id, 1);
    localStorage.setItem('recipes', JSON.stringify(this.recipes)); */
  }
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Löschen',
      message: 'Möchten sie das Rezept wirklich löschen?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          id: 'confirm-button',
          handler: () => {
            console.log('Confirm Okay');
            this.recipes.splice(this.id, 1);
            localStorage.setItem('recipes', JSON.stringify(this.recipes));
            this.router.navigate(['/tabs/tab1']);
          }
        }
      ]
    });
    await alert.present();
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
