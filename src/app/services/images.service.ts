/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Recipe } from 'src/models/Recipe';
import { RecipesService } from './recipes.service';

const IMAGE_DIR = 'stored-images';
export interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagesService {
  images: LocalFile[] = [];
  latestImg: LocalFile;
  newLatestImg = new Subject<LocalFile>();
  photoTaken = false;
  recipes: Recipe[] =[];

  constructor(private loadinCtrl: LoadingController, private recipeService: RecipesService) { }

  async refresh(){
    this.recipes = this.recipeService.getRecipes();
  }

  async takeImage(id: number = this.recipeService.getNewIndex(), save: boolean = true){
    const image: Photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt
    });

    if(image && save){
      this.saveImage(image, id);
      this.photoTaken = true;
    }
    else{
      return image;
    }
  }

  async saveImage(photo: Photo, id: number){
    const fileName = id + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`,
      data: photo.base64String
    });
    this.loadFile(id);
  }

  async loadFile(id: number){
    const loading = await this.loadinCtrl.create({
      message: 'Daten werden geladen...'
    });
    await loading.present();

    const fileName = id + '.jpeg';
    Filesystem.readFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`
    }).then(result => {
      this.latestImg = {
        name: fileName,
        path: `${IMAGE_DIR}/${fileName}`,
        data: `data:image/jpeg;base64,${result.data}`
      };
      this.newLatestImg.next(this.latestImg);
    }, async (err) => {
      console.log('err: ', err);
    }
    ).then(_ => {
      loading.dismiss();
    });
  }




  async loadAllFiles(){
    this.images = [];
    const loading = await this.loadinCtrl.create({
      message: 'Loading data...'
    });
    await loading.present();

    Filesystem.readdir({
      directory: Directory.Data,
      path: IMAGE_DIR
    }).then(result => {
      this.loadFileData(result.files);
    },async (err) => {
      console.log('err: ', err);
      await Filesystem.mkdir({
        directory: Directory.Data,
        path: IMAGE_DIR
      });
    }).then(_ => {
      loading.dismiss();
    });
  }

  private async loadFileData(fileNames: string[]){
    for(const file of fileNames){
      const filePath = `${IMAGE_DIR}/${file}`;

      const readFile = await Filesystem.readFile({
        directory: Directory.Data,
        path: filePath
      });

      this.images.push({
        name: file,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`
      });
    }
  }
}
