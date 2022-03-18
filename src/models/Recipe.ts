import { LocalFile } from 'src/app/tab2/tab2.page';
import { Ingredient } from './Ingredient';

export class Recipe {
    constructor(public title: string, public ingredients: Ingredient[], public description: string, public image: LocalFile){}
}
